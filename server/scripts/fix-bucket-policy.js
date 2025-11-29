const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { S3Client, PutBucketPolicyCommand, DeletePublicAccessBlockCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'my-cms-bucket';

async function fixBucketPolicy() {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }
    ]
  };

  try {
    console.log(`Configuring bucket: ${BUCKET_NAME}...`);

    // 1. Disable "Block Public Access"
    console.log("Disabling 'Block Public Access' settings...");
    try {
        const deleteBlockCommand = new DeletePublicAccessBlockCommand({
            Bucket: BUCKET_NAME
        });
        await s3Client.send(deleteBlockCommand);
        console.log("Successfully disabled 'Block Public Access'.");
    } catch (err) {
        console.warn("Warning: Could not disable 'Block Public Access'. It might already be disabled or you lack permissions.");
        console.warn("Error:", err.message);
    }

    // 2. Apply Bucket Policy
    console.log(`Attempting to apply public read policy...`);
    
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(policy)
    });

    await s3Client.send(command);
    console.log("Successfully applied bucket policy!");
    console.log("Your files should now be publicly accessible.");
    
  } catch (error) {
    console.error("Failed to configure bucket.");
    console.error("Error:", error.message);
    
    if (error.name === 'MethodNotAllowed') {
        console.log("\nNOTE: You might not have permission to set bucket policies with these credentials.");
    }
    
    console.log("\nPlease manually set the following policy in the AWS Console -> S3 -> Permissions -> Bucket Policy:");
    console.log(JSON.stringify(policy, null, 2));
    console.log("\nAlso ensure 'Block all public access' is turned OFF in the Permissions tab.");
  }
}

fixBucketPolicy();
