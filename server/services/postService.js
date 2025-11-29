const { docClient } = require('../db');
const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const POSTS_TABLE = process.env.POSTS_TABLE || 'Posts';
const USERS_TABLE = process.env.USERS_TABLE || 'Users';

const createPost = async (userId, title, content, coverImage, status = 'published') => {
  const postId = uuidv4();
  const params = {
    TableName: POSTS_TABLE,
    Item: {
      postId,
      userId,
      title,
      content,
      coverImage,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  await docClient.send(new PutCommand(params));
  return { postId, message: 'Post created successfully' };
};

const updatePost = async (postId, userId, updates) => {
  // 1. Verify ownership
  const getParams = {
    TableName: POSTS_TABLE,
    Key: { postId }
  };
  const data = await docClient.send(new GetCommand(getParams));
  if (!data.Item || data.Item.userId !== userId) {
    throw new Error('Post not found or unauthorized');
  }

  // 2. Update
  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpression.push(`#field${index} = :value${index}`);
    expressionAttributeNames[`#field${index}`] = key;
    expressionAttributeValues[`:value${index}`] = updates[key];
  });

  // Always update updatedAt
  updateExpression.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const params = {
    TableName: POSTS_TABLE,
    Key: { postId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
};

const deletePost = async (postId, userId) => {
  // 1. Verify ownership
  const getParams = {
    TableName: POSTS_TABLE,
    Key: { postId }
  };
  const data = await docClient.send(new GetCommand(getParams));
  if (!data.Item || data.Item.userId !== userId) {
    throw new Error('Post not found or unauthorized');
  }

  // 2. Delete
  const params = {
    TableName: POSTS_TABLE,
    Key: { postId }
  };

  await docClient.send(new DeleteCommand(params));
  return { message: 'Post deleted successfully' };
};

const API_KEYS_TABLE = process.env.API_KEYS_TABLE || 'ApiKeys';

const getPostsByApiKey = async (apiKey) => {
  // 1. Find user by API Key in ApiKeys table
  const keyParams = {
    TableName: API_KEYS_TABLE,
    Key: { apiKey }
  };

  const keyData = await docClient.send(new GetCommand(keyParams));
  if (!keyData.Item) return null;
  
  const userId = keyData.Item.userId;

  // 2. Get posts for that user (Only published posts for public API)
  const postsParams = {
    TableName: POSTS_TABLE,
    FilterExpression: 'userId = :userId AND #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { 
      ':userId': userId,
      ':status': 'published'
    }
  };

  const postsData = await docClient.send(new ScanCommand(postsParams));
  return postsData.Items;
};

const getPostsByUserId = async (userId) => {
  const params = {
    TableName: POSTS_TABLE,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  };

  const data = await docClient.send(new ScanCommand(params));
  return data.Items;
};

const getPublicPostById = async (postId, apiKey) => {
  // 1. Find user by API Key
  const keyParams = {
    TableName: API_KEYS_TABLE,
    Key: { apiKey }
  };
  const keyData = await docClient.send(new GetCommand(keyParams));
  if (!keyData.Item) return null; // Invalid API Key
  
  const userId = keyData.Item.userId;

  // 2. Get the post
  const postParams = {
    TableName: POSTS_TABLE,
    Key: { postId }
  };
  const postData = await docClient.send(new GetCommand(postParams));
  
  // 3. Verify ownership and status
  if (!postData.Item) return null; // Post not found
  if (postData.Item.userId !== userId) return null; // Post doesn't belong to this API key's user
  if (postData.Item.status !== 'published') return null; // Post is not published

  return postData.Item;
};

module.exports = { createPost, updatePost, deletePost, getPostsByApiKey, getPostsByUserId, getPublicPostById };
