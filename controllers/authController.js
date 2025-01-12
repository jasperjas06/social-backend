const bcrypt = require('bcryptjs');
const jwt = require('../config/jwt'); // Assume this is a utility to generate JWT tokens
const db = require('../config/db'); // Database connection

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, bio, profile_picture } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert user into the database
    const query = `
      INSERT INTO users (username, email, password, full_name, bio, profile_picture) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [username, email, hashedPassword, full_name, bio, profile_picture], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error registering user.', details: err });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error });
  }
};

// Login a user
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging in.', details: err });
    }

    if (!result.length) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.generateToken(user.id); // Generate JWT token
    res.status(200).json({ message: 'Logged in successfully!', token });
  });
};

// Get all users
exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, username, email, full_name, bio, profile_picture, created_at FROM users';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving users.', details: err });
    }
    res.status(200).json({ users: results });
  });
};

// Get a single user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT id, username, email, full_name, bio, profile_picture, created_at FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving user.', details: err });
    }

    if (!results.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ user: results[0] });
  });
};

// Update a user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, full_name, bio, profile_picture } = req.body;

  const query = `
    UPDATE users 
    SET username = ?, email = ?, full_name = ?, bio = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.query(query, [username, email, full_name, bio, profile_picture, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating user.', details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully!' });
  });
};

// Delete a user
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user.', details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully!' });
  });
};
