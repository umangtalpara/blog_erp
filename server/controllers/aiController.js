const aiService = require('../services/aiService');

// Maps service-layer error codes to HTTP status codes
const AI_ERROR_STATUS = {
  AI_NOT_CONFIGURED: 503,
  INVALID_AI_RESPONSE: 502,
  AI_API_ERROR: 502,
};

const handleAIError = (error, res, fallbackMessage) => {
  const status = AI_ERROR_STATUS[error.code] || 500;
  const message = error.code ? error.message : fallbackMessage;
  console.error(`[AI Controller] ${error.message}`);
  return res.status(status).json({ error: message });
};

const generatePost = async (req, res) => {
  const { topic } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required and cannot be empty.' });
  }

  try {
    const result = await aiService.generatePostContent(topic.trim());
    return res.status(200).json(result);
  } catch (error) {
    return handleAIError(error, res, 'Failed to generate post. Please try again.');
  }
};

const improvePost = async (req, res) => {
  const { content, instructions } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required and cannot be empty.' });
  }
  if (!instructions || !instructions.trim()) {
    return res.status(400).json({ error: 'Instructions are required and cannot be empty.' });
  }

  try {
    const improvedContent = await aiService.improvePostContent(content.trim(), instructions.trim());
    return res.status(200).json({ content: improvedContent });
  } catch (error) {
    return handleAIError(error, res, 'Failed to improve post. Please try again.');
  }
};

module.exports = { generatePost, improvePost };
