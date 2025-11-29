require('dotenv').config();
const { docClient } = require('../db');
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const API_KEYS_TABLE = process.env.API_KEYS_TABLE || 'ApiKeys';

async function verify() {
    try {
        // 1. Get an API Key
        console.log('Fetching API Keys...');
        const data = await docClient.send(new ScanCommand({ TableName: API_KEYS_TABLE }));
        
        if (!data.Items || data.Items.length === 0) {
            console.log('No API Keys found. Please create one in the Dashboard first.');
            return;
        }

        const apiKey = data.Items[0].apiKey;
        console.log(`Found API Key: ${apiKey}`);

        // 2. Get All Posts to find an ID
        console.log('Fetching all posts to get an ID...');
        const listResponse = await fetch('http://127.0.0.1:5000/api/public/posts', {
            headers: { 'x-cms-api-key': apiKey }
        });
        
        if (!listResponse.ok) {
            console.error('List API failed:', listResponse.status, await listResponse.text());
            return;
        }

        const posts = await listResponse.json();
        console.log('List API Response:', JSON.stringify(posts).substring(0, 200));
        
        if (!Array.isArray(posts)) {
            console.error('Expected array but got:', typeof posts);
            return;
        }

        if (posts.length === 0) {
            console.log('No posts found to test single post API.');
            return;
        }

        const postId = posts[0].postId;
        console.log(`Testing Single Post API for ID: ${postId}`);

        // 3. Test Single Post API
        const singleResponse = await fetch(`http://127.0.0.1:5000/api/public/posts/${postId}`, {
            headers: { 'x-cms-api-key': apiKey }
        });

        console.log(`Single Post Response Status: ${singleResponse.status}`);
        
        if (singleResponse.ok) {
            const post = await singleResponse.json();
            console.log('Success! Fetched Post Title:', post.title);
            if (post.postId === postId) {
                console.log('Post ID matches.');
            } else {
                console.error('Post ID mismatch!');
            }
        } else {
            console.error('Failed to fetch single post.');
            console.error(await singleResponse.text());
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verify();
