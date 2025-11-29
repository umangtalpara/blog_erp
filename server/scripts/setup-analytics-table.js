const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const TABLE_NAME = process.env.ANALYTICS_TABLE || 'Analytics';

const setupTable = async () => {
  try {
    console.log(`Checking if table '${TABLE_NAME}' exists...`);
    const list = await client.send(new ListTablesCommand({}));
    
    if (list.TableNames.includes(TABLE_NAME)) {
      console.log(`Table '${TABLE_NAME}' already exists.`);
      return;
    }

    console.log(`Creating table '${TABLE_NAME}'...`);
    const params = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: "eventId", KeyType: "HASH" } // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: "eventId", AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await client.send(new CreateTableCommand(params));
    console.log(`Table '${TABLE_NAME}' created successfully.`);
    console.log('Waiting for table to be active...');
    // In a real script we might wait for status, but for now we just exit
  } catch (error) {
    console.error('Error setting up table:', error);
  }
};

setupTable();
