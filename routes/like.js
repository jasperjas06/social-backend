const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController.js'); // Import the like controller

// 1. Read Routes
router.get('/likes/post/:post_id', likeController.getLikesForPost); // Get all likes for a post
router.get('/likes/user/:user_id', likeController.getLikesByUser); // Get all posts liked by a user
router.get('/likes/check', likeController.checkUserLike); // Check if a user liked a specific post

// 2. Create Routes
router.post('/likes', likeController.likePost); // Like a post

// 3. Delete Routes
router.delete('/likes', likeController.unlikePost); // Remove a like from a post

module.exports = router;
