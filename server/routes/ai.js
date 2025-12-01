const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticateToken = require('../middleware/auth');

router.post('/generate', authenticateToken, aiController.generatePost);
router.post('/improve', authenticateToken, aiController.improvePost);

module.exports = router;
