const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticateToken = require('../middleware/auth');

router.post('/generate', authenticateToken, aiController.generatePost);
router.post('/improve', authenticateToken, aiController.improvePost);

// Public endpoint — no auth needed for a quick LLM connectivity check
router.get('/test', aiController.testConnection);

module.exports = router;
