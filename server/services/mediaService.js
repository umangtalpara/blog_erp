const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  requestChecksumCalculation: "WHEN_REQUIRED"
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'my-cms-bucket';

const generateUploadUrl = async (fileName, fileType) => {
  const key = `${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
  return { url, key, publicUrl };
};

module.exports = { generateUploadUrl };
