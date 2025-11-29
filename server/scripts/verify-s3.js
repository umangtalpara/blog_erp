require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const verifyS3 = async () => {
    console.log("Checking AWS Credentials...");
    if (!process.env.AWS_ACCESS_KEY_ID) console.error("❌ AWS_ACCESS_KEY_ID is missing");
    if (!process.env.AWS_SECRET_ACCESS_KEY) console.error("❌ AWS_SECRET_ACCESS_KEY is missing");
    if (!process.env.AWS_REGION) console.error("❌ AWS_REGION is missing");
    if (!process.env.S3_BUCKET_NAME) console.error("❌ S3_BUCKET_NAME is missing");

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
        console.log("Please configure your .env file with valid AWS credentials.");
        return;
    }

    console.log("Credentials present. Testing S3 connection...");

    const s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: "test-upload.txt",
            ContentType: "text/plain",
            ACL: 'public-read'
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        console.log("✅ Successfully generated pre-signed URL:", url);
        console.log("S3 configuration is valid.");
    } catch (error) {
        console.error("❌ Failed to generate pre-signed URL:", error.message);
        if (error.name === 'InvalidAccessKeyId') {
            console.error("The Access Key ID is invalid.");
        } else if (error.name === 'SignatureDoesNotMatch') {
            console.error("The Secret Access Key is invalid.");
        }
    }
};

verifyS3();
