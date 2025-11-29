const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');


const authenticateToken = require('../middleware/auth');

// Create Post (Protected)
router.post('/posts', authenticateToken, postController.createPost);
router.put('/posts/:id', authenticateToken, postController.updatePost);
router.delete('/posts/:id', authenticateToken, postController.deletePost);
router.get('/posts', authenticateToken, postController.getUserPosts);

// Get Public Posts (Public API)
router.get('/public/posts', postController.getPublicPosts);
router.get('/public/posts/:id', postController.getPublicPost);

module.exports = router;
