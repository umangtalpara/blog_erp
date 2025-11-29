const request = require('supertest');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const app = require('../index');
const assert = require('assert');

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

describe('API Key Management Flow', function() {
  let token;
  let userId;
  let apiKey;

  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
    
    // Mock S3
    s3Mock.on(PutObjectCommand).resolves({});
  });

  it('should register a user and get a token', async () => {
    // Mock DynamoDB Put for registration
    ddbMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'apikeyuser@example.com',
        password: 'password123'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token);
    assert.ok(res.body.userId);
    token = res.body.token;
    userId = res.body.userId;
  });

  it('should create a new API key', async () => {
    // Mock PutCommand for creating key
    ddbMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post('/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Key' });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.apiKey);
    assert.strictEqual(res.body.name, 'Test Key');
    apiKey = res.body.apiKey;
  });

  it('should list API keys', async () => {
    // Mock QueryCommand for listing keys
    ddbMock.on(QueryCommand).resolves({
      Items: [
        { apiKey: apiKey, name: 'Test Key', userId: userId, createdAt: new Date().toISOString() }
      ]
    });

    const res = await request(app)
      .get('/api-keys')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].apiKey, apiKey);
  });

  it('should fetch posts using the new API key', async () => {
    // Mock GetCommand for API Key lookup
    ddbMock.on(GetCommand).resolves({
      Item: { apiKey: apiKey, userId: userId }
    });

    // Mock ScanCommand for fetching posts
    ddbMock.on(ScanCommand).resolves({
      Items: [
        { postId: 'p1', title: 'Test Post', content: 'Content' }
      ]
    });

    const res = await request(app)
      .get('/api/public/posts')
      .set('x-cms-api-key', apiKey);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 1);
  });

  it('should delete an API key', async () => {
    // Mock DeleteCommand
    ddbMock.on(DeleteCommand).resolves({});

    const res = await request(app)
      .delete(`/api-keys/${apiKey}`)
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.statusCode, 200);
  });
});
