const { docClient } = require('../db');
const { PutCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const API_KEYS_TABLE = process.env.API_KEYS_TABLE || 'ApiKeys';

const createApiKey = async (userId, name = 'Default Key') => {
  const apiKey = uuidv4();
  const params = {
    TableName: API_KEYS_TABLE,
    Item: {
      apiKey,
      userId,
      name,
      createdAt: new Date().toISOString()
    }
  };

  await docClient.send(new PutCommand(params));
  return { apiKey, name, userId };
};

const listApiKeys = async (userId) => {
  const params = {
    TableName: API_KEYS_TABLE,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  const data = await docClient.send(new QueryCommand(params));
  return data.Items;
};

const deleteApiKey = async (apiKey, userId) => {
  // First verify the key belongs to the user
  // Since we don't have a direct lookup by key+user without GSI or Scan, 
  // and we want to be efficient, we can query by GSI to find if it exists for user, 
  // OR just delete it if we trust the caller. 
  // Better approach: Get item by PK (apiKey) and check userId.
  
  // Actually, our PK is apiKey. So we can just Get it.
  // But wait, GetCommand needs the PK.
  // Let's just do a Delete with a ConditionExpression.
  
  const params = {
    TableName: API_KEYS_TABLE,
    Key: { apiKey },
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  try {
    await docClient.send(new DeleteCommand(params));
    return true;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return false; // Key doesn't exist or doesn't belong to user
    }
    throw err;
  }
};

module.exports = { createApiKey, listApiKeys, deleteApiKey };
