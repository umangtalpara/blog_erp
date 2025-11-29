const { docClient } = require('../db');
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || 'Analytics';

const logEvent = async (type, data) => {
  const eventId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const params = {
    TableName: ANALYTICS_TABLE,
    Item: {
      eventId,
      type, // 'share' or 'comment'
      timestamp,
      ...data
    }
  };

  await docClient.send(new PutCommand(params));
  return { eventId, message: 'Event logged successfully' };
};

const getLogs = async () => {
  const params = {
    TableName: ANALYTICS_TABLE
  };

  const data = await docClient.send(new ScanCommand(params));
  // Sort by timestamp desc
  return data.Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const getStats = async () => {
  const logs = await getLogs();
  
  const stats = {
    totalShares: logs.filter(l => l.type === 'share').length,
    totalComments: logs.filter(l => l.type === 'comment').length,
    recentActivity: logs.slice(0, 10)
  };
  
  return stats;
};

module.exports = { logEvent, getLogs, getStats };
