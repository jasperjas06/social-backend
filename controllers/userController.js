const db = require('../config/db');

// 1. Read: Get user profile by user ID
// Assuming you're using a middleware that adds `req.user` from the JWT token
exports.getProfile = (req, res) => {
  const userId = req.query.id; // Get user id from query parameters
  console.log(userId, "id");

  const query = 'SELECT id, username, full_name, bio, profile_picture,email, created_at, updated_at FROM users WHERE id = ?';

  // Check if the userId is provided in the query string
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Query the database to find the user by their ID
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch profile', message: err.message });
    }

    // If no user is found, return a 404 response
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If the user is found, send back the profile data
    res.status(200).json({ profile: result[0] });
  });
};




// 2. Read: Get all followers of a user
exports.getFollowers = (req, res) => {
  const query = 'SELECT u.* FROM users u JOIN followers f ON u.id = f.follower_id WHERE f.following_id = ?';
  db.query(query, [req.user], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch followers', err });
    res.status(200).json({ followers: result });
  });
};

// 3. Create: Follow a user (insert into followers table)
exports.followUser = (req, res) => {
  const { following_id } = req.body;
  const query = 'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)';
  db.query(query, [req.user, following_id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to follow user', err });
    res.status(201).json({ message: 'Followed successfully' });
  });
};

// 4. Update: Update user profile
exports.updateProfile = (req, res) => {
  const { username, email, profile_picture, bio, full_name,userId } = req.body; // Destructure all the fields from req.body
  // const userId = req.user; // Assuming req.user contains the user's ID after authentication

  // Log the incoming data for debugging
  console.log('Request Body:', req.body);
  console.log('User ID:', userId);

  // SQL query to update the user profile
  const query = `
    UPDATE users 
    SET username = ?, email = ?, profile_picture = ?, bio = ?, full_name = ? 
    WHERE id = ?
  `;

  // Log the query to verify it's constructed properly
  console.log('SQL Query:', query);
  console.log('Query Parameters:', [username, email, profile_picture, bio, full_name, userId]);

  // Execute the query with the provided values
  db.query(query, [username, email, profile_picture, bio, full_name, userId], (err, result) => {
    if (err) {
      console.error(err);  // Log the error for debugging
      return res.status(500).json({ error: 'Failed to update profile', err });
    }
    
    // Log the result to verify the query execution
    console.log('Query result:', result);

    if (result.affectedRows === 0) {
      // This indicates that no row was updated, possibly due to an incorrect ID or no changes in the values
      return res.status(404).json({ error: 'No profile found to update' });
    }

    console.log('Profile updated successfully');
    res.status(200).json({ message: 'Profile updated successfully' });
  });
};




// 5. Delete: Unfollow a user (delete from followers table)
exports.unfollowUser = (req, res) => {
  const { following_id } = req.body;
  const query = 'DELETE FROM followers WHERE follower_id = ? AND following_id = ?';
  db.query(query, [req.user, following_id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to unfollow user', err });
    res.status(200).json({ message: 'Unfollowed successfully' });
  });
};

// 6. Delete: Delete user account
exports.deleteUser = (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [req.user], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete user', err });
    res.status(200).json({ message: 'User deleted successfully' });
  });
};
