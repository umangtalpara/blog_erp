const API_URL = 'http://localhost:5000';

async function generateAnalyticsData() {
  try {
    console.log('--- Generating Dummy Analytics Data ---');

    // Helper for fetch requests
    const request = async (url, method = 'GET', body = null) => {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);
      
      const res = await fetch(url, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      return data;
    };

    // 1. Track Shares
    console.log('\n1. Tracking Shares...');
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'share', data: { postId: 'test-post-1', platform: 'twitter' } });
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'share', data: { postId: 'test-post-2', platform: 'facebook' } });
    console.log('Shares tracked.');

    // 2. Track Comments
    console.log('\n2. Tracking Comments...');
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'comment', data: { postId: 'test-post-1', content: 'Great post!' } });
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'comment', data: { postId: 'test-post-3', content: 'Nice work.' } });
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'comment', data: { postId: 'test-post-1', content: 'Very helpful.' } });
    console.log('Comments tracked.');

    // 3. Track Views
    console.log('\n3. Tracking Views...');
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'view', data: { postId: 'test-post-1' } });
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'view', data: { postId: 'test-post-1' } });
    await request(`${API_URL}/analytics/track`, 'POST', { type: 'view', data: { postId: 'test-post-2' } });
    console.log('Views tracked.');

    console.log('\nSUCCESS: Dummy data generated.');

  } catch (error) {
    console.error('\nGENERATION FAILED:', error.message);
  }
}

generateAnalyticsData();
