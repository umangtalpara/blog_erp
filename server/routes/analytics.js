const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Public route to track events (e.g. from public blog pages)
router.post('/track', analyticsController.trackEvent);

// Protected route to view stats (dashboard only)
// Note: You might want to add authenticateToken middleware here if strict security is needed
router.get('/stats', analyticsController.getStats);

module.exports = router;
