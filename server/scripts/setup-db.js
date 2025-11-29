const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const dotenv = require('dotenv');

dotenv.config();

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const USERS_TABLE = process.env.USERS_TABLE || 'Users';
const POSTS_TABLE = process.env.POSTS_TABLE || 'Posts';

const createTable = async (tableName, keySchema, attributeDefinitions, globalSecondaryIndexes = []) => {
  try {
    const data = await client.send(new ListTablesCommand({}));
    if (data.TableNames.includes(tableName)) {
      console.log(`Table ${tableName} already exists.`);
      return;
    }

    const params = {
      TableName: tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    if (globalSecondaryIndexes.length > 0) {
      params.GlobalSecondaryIndexes = globalSecondaryIndexes;
    }

    await client.send(new CreateTableCommand(params));
    console.log(`Table ${tableName} created successfully.`);
  } catch (err) {
    console.error(`Error creating table ${tableName}:`, err);
  }
};

const setup = async () => {
  await createTable(
    USERS_TABLE,
    [{ AttributeName: "userId", KeyType: "HASH" }],
    [{ AttributeName: "userId", AttributeType: "S" }]
  );

  await createTable(
    POSTS_TABLE,
    [{ AttributeName: "postId", KeyType: "HASH" }],
    [{ AttributeName: "postId", AttributeType: "S" }]
  );

  const API_KEYS_TABLE = process.env.API_KEYS_TABLE || 'ApiKeys';
  await createTable(
    API_KEYS_TABLE,
    [{ AttributeName: "apiKey", KeyType: "HASH" }],
    [
      { AttributeName: "apiKey", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" }
    ],
    [
      {
        IndexName: "UserIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ]
  );
};

setup();
