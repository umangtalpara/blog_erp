const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
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

router.use(authenticateToken);

router.post('/', apiKeyController.createApiKey);
router.get('/', apiKeyController.listApiKeys);
router.delete('/:apiKey', apiKeyController.deleteApiKey);

module.exports = router;
