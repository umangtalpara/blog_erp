const aiService = require('../services/aiService');

const generatePost = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const result = await aiService.generatePostContent(topic);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate post' });
  }
};

const improvePost = async (req, res) => {
  const { content, instructions } = req.body;
  if (!content || !instructions) {
    return res.status(400).json({ error: 'Content and instructions are required' });
  }

  try {
    const improvedContent = await aiService.improvePostContent(content, instructions);
    res.json({ content: improvedContent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to improve post' });
  }
};

module.exports = { generatePost, improvePost };
