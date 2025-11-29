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

        // 2. Test Public API
        console.log('Testing Public API...');
        try {
            const response = await fetch('http://localhost:5000/api/public/posts', {
                headers: { 'x-cms-api-key': apiKey }
            });
            
            console.log(`API Response Status: ${response.status}`);
            
            if (!response.ok) {
                const text = await response.text();
                console.error('Error Body:', text);
                return;
            }

            const posts = await response.json();
            console.log(`Posts Found: ${posts.length}`);
            if (posts.length > 0) {
                console.log('First Post Title:', posts[0].title);
            }
        } catch (err) {
            console.error('API Request Failed:', err.message);
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verify();
