const db = require('../config/db'); // Assuming you have a db configuration set up

// 1. Read Routes

// Get all likes for a specific post
exports.getLikesForPost = async (req, res) => {
  const { post_id } = req.params;

  try {
    const [likes] = await db.query('SELECT * FROM likes WHERE post_id = ?', [post_id]);
    
    if (likes.length === 0) {
      return res.status(404).json({ message: 'No likes found for this post.' });
    }

    res.status(200).json({ likes });
  } catch (error) {
    console.error('Error fetching likes for post:', error);
    res.status(500).json({ error: 'Failed to fetch likes. Please try again later.' });
  }
};

// Get all posts liked by a specific user
exports.getLikesByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [likes] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [user_id]);

    if (likes.length === 0) {
      return res.status(404).json({ message: 'No likes found for this user.' });
    }

    const likedPosts = likes.map(like => like.post_id);
    res.status(200).json({ likedPosts });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    res.status(500).json({ error: 'Failed to retrieve user likes. Please try again later.' });
  }
};

// Check if a user has liked a specific post
exports.checkUserLike = async (req, res) => {
  const { post_id, user_id } = req.query;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'Post ID and User ID are required.' });
  }

  try {
    const [like] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);

    if (like.length > 0) {
      return res.status(200).json({ message: 'User has liked this post.' });
    } else {
      return res.status(200).json({ message: 'User has not liked this post.' });
    }
  } catch (error) {
    console.error('Error checking like:', error);
    res.status(500).json({ error: 'Failed to check like. Please try again later.' });
  }
};

// 2. Create Routes

// Like a post
exports.likePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'Post ID and User ID are required.' });
  }

  try {
    // Check if the like already exists
    const [existingLike] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);

    if (existingLike.length > 0) {
      return res.status(400).json({ error: 'You have already liked this post.' });
    }

    // Insert new like
    await db.query('INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())', [post_id, user_id]);

    res.status(201).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like the post. Please try again later.' });
  }
};

// 3. Delete Routes

// Unlike a post
exports.unlikePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!post_id || !user_id) {
    return res.status(400).json({ error: 'Post ID and User ID are required.' });
  }

  try {
    // Check if the like exists
    const [like] = await db.query('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);

    if (like.length === 0) {
      return res.status(404).json({ error: 'Like not found.' });
    }

    // Remove the like
    await db.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);

    res.status(200).json({ message: 'Like removed successfully.' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Failed to remove like. Please try again later.' });
  }
};
