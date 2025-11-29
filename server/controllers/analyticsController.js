
const analyticsService = require('../services/analyticsService');

const trackEvent = async (req, res) => {
  const { type, data } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Event type is required' });
  }

  try {
    const result = await analyticsService.logEvent(type, data || {});
    res.json(result);
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Could not track event' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await analyticsService.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Could not fetch analytics' });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const comments = await analyticsService.getComments(postId, userId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Could not fetch comments' });
  }
};

const getPostStats = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const stats = await analyticsService.getPostStats(postId, userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({ error: 'Could not fetch post stats' });
  }
};

const getAllPostStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await analyticsService.getAllPostStats(userId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch post stats' });
  }
};

module.exports = { trackEvent, getStats, getComments, getPostStats, getAllPostStats };
