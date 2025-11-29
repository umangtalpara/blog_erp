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
    const stats = await analyticsService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Could not fetch analytics' });
  }
};

module.exports = { trackEvent, getStats };
