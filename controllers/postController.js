const db = require('../config/db');

// Create a new post
// Create a new post
exports.createPost = (req, res) => {
  const { user_id, image_url, caption } = req.body; // Ensure user_id is provided in the request body
  if (!user_id || !image_url) {
    return res.status(400).json({ error: 'user_id and image_url are required' });
  }

  // Ensure that likes and comments are initialized as empty JSON arrays
  const query = 'INSERT INTO posts (user_id, image_url, caption, likes, comments) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [user_id, image_url, caption, JSON.stringify([]), JSON.stringify([])], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to create post', err });
    res.status(201).json({ message: 'Post created successfully' });
  });
};


// Like a post
exports.likePost = (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({ error: 'User ID and Post ID are required' });
  }

  // Get the current likes array from the post
  const selectQuery = 'SELECT likes FROM posts WHERE id = ?';
  db.query(selectQuery, [post_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching post data', err });
    if (result.length === 0) return res.status(404).json({ message: 'Post not found' });

    let likes = result[0].likes;

    // Ensure that likes is an array (if it's not, create an empty array)
    if (typeof likes === 'string') {
      // If it's a string, parse it as JSON
      likes = JSON.parse(likes);
    } else if (!Array.isArray(likes)) {
      // If it's neither a string nor an array, set it as an empty array
      likes = [];
    }

    // Check if the user has already liked the post
    if (likes.some(like => like.user_id === user_id)) {
      return res.status(400).json({ error: 'You have already liked this post' });
    }

    // Add the new user_id to the likes array
    likes.push({ user_id: user_id });

    // Update the post with the new likes array (add the new like, don't replace the array)
    const updateQuery = 'UPDATE posts SET likes = ? WHERE id = ?';
    db.query(updateQuery, [JSON.stringify(likes), post_id], (err) => {
      if (err) return res.status(500).json({ error: 'Error liking the post', err });
      res.status(200).json({ message: 'Post liked successfully' });
    });
  });
};



// Comment on a post
// Comment on a post
exports.commentOnPost = (req, res) => {
  const { user_id, post_id, comment } = req.body;

  if (!user_id || !post_id || !comment) {
    return res.status(400).json({ error: 'User ID, Post ID, and comment are required' });
  }

  // Get the current comments array from the post
  const selectQuery = 'SELECT comments FROM posts WHERE id = ?';
  db.query(selectQuery, [post_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching post data', err });
    if (result.length === 0) return res.status(404).json({ message: 'Post not found' });

    let comments = result[0].comments;

    // Ensure that comments is an array (if it's a string, parse it)
    if (typeof comments === 'string') {
      // If it's a string, parse it as JSON
      comments = JSON.parse(comments);
    } else if (!Array.isArray(comments)) {
      // If it's not an array or string, initialize as an empty array
      comments = [];
    }

    // Add the new comment with user_id and comment text
    comments.push({ user_id: user_id, comment: comment });

    // Update the post with the new comments array (add the new comment, don't replace the array)
    const updateQuery = 'UPDATE posts SET comments = ? WHERE id = ?';
    db.query(updateQuery, [JSON.stringify(comments), post_id], (err) => {
      if (err) return res.status(500).json({ error: 'Error commenting on the post', err });
      res.status(200).json({ message: 'Comment added successfully' });
    });
  });
};




// Read all posts
exports.getPosts = (req, res) => {
  const query = `
    SELECT 
      posts.id, 
      posts.user_id, 
      posts.image_url, 
      posts.caption, 
      posts.created_at, 
      users.username AS author, 
      users.profile_picture AS author_avatar,
      posts.likes,   -- Fetch raw likes JSON from the database
      posts.comments -- Fetch raw comments JSON from the database
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;

  db.query(query, (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch posts', err });
    }

    // Ensure likes and comments are parsed correctly
    const formattedPosts = posts.map(post => {
      try {
        return {
          ...post,
          likes: typeof post.likes === 'string' ? JSON.parse(post.likes) : post.likes || [],
          comments: typeof post.comments === 'string' ? JSON.parse(post.comments) : post.comments || []
        };
      } catch (parseErr) {
        console.error(`Error parsing JSON for post ID ${post.id}:`, parseErr);
        return {
          ...post,
          likes: [],
          comments: []
        };
      }
    });

    res.status(200).json({ posts: formattedPosts });
  });
};




// Read a single post by ID
exports.getPostsByUserId = (req, res) => {
  const { id } = req.query;  // Use req.query to access the user ID from query parameters
  const query = `
    SELECT 
      posts.id, posts.user_id, posts.image_url, posts.caption, posts.created_at, 
      users.username AS author 
    FROM posts 
    INNER JOIN users ON posts.user_id = users.id 
    WHERE posts.user_id = ?
  `;

  db.query(query, [id], (err, posts) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch posts', err });
    if (posts.length === 0) return res.status(404).json({ message: 'No posts found for this user' });
    res.status(200).json({ posts });  // Return the list of posts
  });
};



// Update a post by ID
exports.updatePost = (req, res) => {
  const { id } = req.params;
  const { image_url, caption } = req.body;

  if (!image_url && !caption) {
    return res.status(400).json({ error: 'At least one field (image_url or caption) is required for update' });
  }

  const fieldsToUpdate = [];
  const values = [];
  if (image_url) {
    fieldsToUpdate.push('image_url = ?');
    values.push(image_url);
  }
  if (caption) {
    fieldsToUpdate.push('caption = ?');
    values.push(caption);
  }
  values.push(id);

  const query = `UPDATE posts SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update post', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post updated successfully' });
  });
};

// Delete a post by ID
exports.deletePost = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM posts WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete post', err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post deleted successfully' });
  });
};
