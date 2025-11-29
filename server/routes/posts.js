const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create Post (Protected)
router.post('/posts', authenticateToken, postController.createPost);
router.put('/posts/:id', authenticateToken, postController.updatePost);
router.delete('/posts/:id', authenticateToken, postController.deletePost);
router.get('/posts', authenticateToken, postController.getUserPosts);

// Get Public Posts (Public API)
router.get('/public/posts', postController.getPublicPosts);
router.get('/public/posts/:id', postController.getPublicPost);

module.exports = router;
