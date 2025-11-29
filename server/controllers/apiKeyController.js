const apiKeyService = require('../services/apiKeyService');

const createApiKey = async (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body;

  try {
    const result = await apiKeyService.createApiKey(userId, name);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create API key' });
  }
};

const listApiKeys = async (req, res) => {
  const userId = req.user.userId;

  try {
    const keys = await apiKeyService.listApiKeys(userId);
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not list API keys' });
  }
};

const deleteApiKey = async (req, res) => {
  const userId = req.user.userId;
  const { apiKey } = req.params;

  try {
    const success = await apiKeyService.deleteApiKey(apiKey, userId);
    if (success) {
      res.json({ message: 'API Key deleted' });
    } else {
      res.status(404).json({ error: 'API Key not found or access denied' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete API key' });
  }
};

module.exports = { createApiKey, listApiKeys, deleteApiKey };
