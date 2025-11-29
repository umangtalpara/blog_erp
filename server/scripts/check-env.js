const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT SET");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "SET" : "NOT SET");
console.log("AWS_REGION:", process.env.AWS_REGION ? "SET" : "NOT SET");
console.log("S3_BUCKET_NAME:", process.env.S3_BUCKET_NAME ? "SET" : "NOT SET");
