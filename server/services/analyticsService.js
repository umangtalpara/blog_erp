const { docClient } = require('../db');
const postService = require('./postService');
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

const getComments = async (postId, userId) => {
  // Verify ownership
  const posts = await postService.getPostsByUserId(userId);
  const userPostIds = posts.map(p => p.postId);
  
  if (!userPostIds.includes(postId)) {
    throw new Error('Unauthorized access to post stats');
  }

  const logs = await getLogs();
  return logs.filter(l => l.type === 'comment' && l.postId === postId);
};

const getPostStats = async (postId, userId) => {
  // Verify ownership
  const posts = await postService.getPostsByUserId(userId);
  const userPostIds = posts.map(p => p.postId);
  
  if (!userPostIds.includes(postId)) {
    throw new Error('Unauthorized access to post stats');
  }

  const logs = await getLogs();
  const postLogs = logs.filter(l => l.postId === postId);
  
  return {
    views: postLogs.filter(l => l.type === 'view').length,
    shares: postLogs.filter(l => l.type === 'share').length,
    comments: postLogs.filter(l => l.type === 'comment').length,
    likes: postLogs.filter(l => l.type === 'like').length
  };
};

const getStats = async (userId) => {
  const logs = await getLogs();
  const posts = await postService.getPostsByUserId(userId);
  const userPostIds = posts.map(p => p.postId);
  
  // Filter logs for user's posts
  const userLogs = logs.filter(l => userPostIds.includes(l.postId));
  
  const stats = {
    totalViews: userLogs.filter(l => l.type === 'view').length,
    totalShares: userLogs.filter(l => l.type === 'share').length,
    totalComments: userLogs.filter(l => l.type === 'comment').length,
    totalLikes: userLogs.filter(l => l.type === 'like').length,
    recentActivity: userLogs.slice(0, 10)
  };
  
  return stats;
};

const getAllPostStats = async (userId) => {
  const logs = await getLogs();
  const posts = await postService.getPostsByUserId(userId);
  const userPostIds = posts.map(p => p.postId);

  const stats = {};

  // Initialize stats for all user posts
  userPostIds.forEach(id => {
    stats[id] = { views: 0, shares: 0, comments: 0, likes: 0 };
  });

  logs.forEach(log => {
    if (!log.postId || !userPostIds.includes(log.postId)) return;
    
    if (log.type === 'view') stats[log.postId].views++;
    if (log.type === 'share') stats[log.postId].shares++;
    if (log.type === 'comment') stats[log.postId].comments++;
    if (log.type === 'like') stats[log.postId].likes++;
  });

  return stats;
};

module.exports = { logEvent, getLogs, getStats, getComments, getPostStats, getAllPostStats };
