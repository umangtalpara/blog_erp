const { mockClient } = require("aws-sdk-client-mock");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const request = require("supertest");
const app = require("../index"); // Import the Express app
const assert = require("assert");

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

describe("CMS Verification Flow", () => {
  let userId;
  let apiKey;
  let token;

  beforeEach(() => {
    ddbMock.reset();
    s3Mock.reset();
  });

  it("should register a user", async () => {
    ddbMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "password", username: "testuser" });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.userId);
    assert.ok(res.body.apiKey);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.username, "testuser");

    userId = res.body.userId;
    apiKey = res.body.apiKey;
    token = res.body.token;
  });

  it("should generate an upload URL", async () => {
    // Mock S3 presigned URL generation (it's not directly mocked by aws-sdk-client-mock easily for getSignedUrl, 
    // but the command itself is sent to the client).
    // Actually getSignedUrl doesn't send a command to the network, it's local.
    // However, we can check if the endpoint returns a URL.
    
    const res = await request(app)
      .get("/media/upload-url?fileName=test.jpg&fileType=image/jpeg");

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.url);
  });

  it("should create a post", async () => {
    ddbMock.on(PutCommand).resolves({});

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Post",
        content: "<p>Hello World</p>",
        coverImage: "https://s3.amazonaws.com/bucket/test.jpg"
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.postId);
  });

  it("should fetch posts via public API", async () => {
    // Mock finding user by API Key
    // Mock finding user by API Key
    ddbMock.on(GetCommand, {
        TableName: "ApiKeys",
        Key: { apiKey: apiKey }
    }).resolves({
        Item: { userId: userId, apiKey: apiKey }
    });

    // Mock finding posts for user
    ddbMock.on(ScanCommand, {
        TableName: "Posts",
        FilterExpression: 'userId = :userId'
    }).resolves({
        Items: [{
            postId: "123",
            userId: userId,
            title: "Test Post",
            content: "<p>Hello World</p>"
        }]
    });

    const res = await request(app)
      .get("/api/public/posts")
      .set("x-cms-api-key", apiKey);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].title, "Test Post");
  });

  it("should fetch user posts via authenticated API", async () => {
    // Mock finding posts for user
    ddbMock.on(ScanCommand, {
        TableName: "Posts",
        FilterExpression: 'userId = :userId'
    }).resolves({
        Items: [{
            postId: "123",
            userId: userId,
            title: "Test Post",
            content: "<p>Hello World</p>",
            createdAt: new Date().toISOString()
        }]
    });

    const res = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].title, "Test Post");
  });
});
