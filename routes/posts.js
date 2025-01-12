const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, commentOnPost,  getPostsByUserId } = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to create a post
router.post('/create', authMiddleware, createPost);

// Route to get all posts
router.get('/get', authMiddleware, getPosts);

// Route to like a post
router.post('/like', authMiddleware, likePost);

// Route to comment on a post
router.post('/comment', authMiddleware, commentOnPost);

router.get("/getbyId", getPostsByUserId)

module.exports = router;
