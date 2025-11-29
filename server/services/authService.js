const { docClient } = require('../db');
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const USERS_TABLE = process.env.USERS_TABLE || 'Users';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const register = async (email, password, username) => {
  const userId = uuidv4();
  const apiKey = uuidv4();

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      email,
      password, // In production, hash this!
      username,
      apiKey
    }
  };

  await docClient.send(new PutCommand(params));
  const token = jwt.sign({ userId, email }, JWT_SECRET);
  return { userId, apiKey, token, username };
};

const login = async (email, password) => {
  const params = {
    TableName: USERS_TABLE,
    FilterExpression: 'email = :email AND password = :password',
    ExpressionAttributeValues: {
      ':email': email,
      ':password': password
    }
  };

  const data = await docClient.send(new ScanCommand(params));
  if (data.Items.length > 0) {
    const user = data.Items[0];
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET);
    return { userId: user.userId, apiKey: user.apiKey, token, username: user.username };
  }
  return null;
};

module.exports = { register, login };
