const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import the controller

// 1. Read Routes
router.get('/profile', userController.getProfile); // Get user profile
router.get('/followers', userController.getFollowers); // Get followers of the logged-in user

// 2. Create Routes
router.post('/follow', userController.followUser); // Follow a user
router.put('/update-profile', userController.updateProfile); // Update user profile

// 3. Delete Routes
router.delete('/unfollow', userController.unfollowUser); // Unfollow a user
router.delete('/delete-user', userController.deleteUser); // Delete user account

module.exports = router;
