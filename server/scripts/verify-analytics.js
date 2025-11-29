require('dotenv').config();

async function verifyAnalytics() {
    try {
        console.log('Testing Analytics API...');
        const response = await fetch('http://127.0.0.1:5000/analytics/posts');
        
        if (!response.ok) {
            console.error('Analytics API failed:', response.status, await response.text());
            return;
        }

        const stats = await response.json();
        console.log('Analytics Stats:', JSON.stringify(stats, null, 2));
        
        if (typeof stats === 'object') {
            const firstPostId = Object.keys(stats)[0];
            if (firstPostId && stats[firstPostId].hasOwnProperty('likes')) {
                console.log('Success! Analytics stats fetched and include "likes".');
            } else {
                console.error('Stats fetched but "likes" property is missing.');
            }
        } else {
            console.error('Expected object but got:', typeof stats);
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verifyAnalytics();
