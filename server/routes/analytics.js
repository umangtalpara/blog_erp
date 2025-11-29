const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/auth');

// Public route to track events (e.g. from public blog pages)
router.post('/track', analyticsController.trackEvent);

// Protected route to view stats (dashboard only)
router.get('/stats', authenticateToken, analyticsController.getStats);
router.get('/stats/:postId', authenticateToken, analyticsController.getPostStats);
router.get('/posts', authenticateToken, analyticsController.getAllPostStats);
router.get('/comments/:postId', authenticateToken, analyticsController.getComments);

module.exports = router;
