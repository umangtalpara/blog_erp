const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { S3Client, GetBucketPolicyCommand, GetPublicAccessBlockCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'my-cms-bucket';

async function checkBucketAccess() {
  console.log(`Checking access for bucket: ${BUCKET_NAME}...\n`);

  // 1. Check Public Access Block
  try {
    const command = new GetPublicAccessBlockCommand({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(command);
    console.log("--- Public Access Block Settings ---");
    console.log(JSON.stringify(response.PublicAccessBlockConfiguration, null, 2));
  } catch (error) {
    if (error.name === 'NoSuchPublicAccessBlockConfiguration') {
        console.log("--- Public Access Block Settings ---");
        console.log("No Public Access Block configuration found (This is good for public buckets).");
    } else {
        console.error("Error checking Public Access Block:", error.message);
    }
  }

  console.log("\n");

  // 2. Check Bucket Policy
  try {
    const command = new GetBucketPolicyCommand({ Bucket: BUCKET_NAME });
    const response = await s3Client.send(command);
    console.log("--- Bucket Policy ---");
    console.log(JSON.parse(response.Policy));
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
        console.log("--- Bucket Policy ---");
        console.log("No bucket policy found.");
    } else {
        console.error("Error checking Bucket Policy:", error.message);
    }
  }
}

checkBucketAccess();
