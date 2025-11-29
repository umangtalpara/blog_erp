const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = `testuser-${uuidv4()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_USERNAME = `testuser-${uuidv4().substring(0, 8)}`;

async function testCreatePostFlow() {
  try {
    console.log('--- Starting Create Post Flow Test ---');

    // Helper for fetch requests
    const request = async (url, method = 'GET', body = null, headers = {}) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      if (body) options.body = JSON.stringify(body);
      
      const res = await fetch(url, options);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      return data;
    };

    // 1. Register
    console.log(`\n1. Registering user: ${TEST_EMAIL}`);
    try {
      await request(`${API_URL}/auth/register`, 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        username: TEST_USERNAME
      });
      console.log('User registered successfully.');
    } catch (error) {
      console.error('Registration failed:', error.message);
    }

    // 2. Login
    console.log('\n2. Logging in...');
    const loginData = await request(`${API_URL}/auth/login`, 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    const { token, userId } = loginData;
    console.log('Login successful. Token received.');

    // 3. Get Upload URL (Cover Image)
    console.log('\n3. Getting Upload URL for Cover Image...');
    const coverRes = await request(`${API_URL}/media/upload-url?fileName=cover.png&fileType=image/png`);
    const coverUrl = coverRes.url;
    const coverPublicUrl = coverRes.publicUrl;
    console.log('Cover Image Upload URL received.');
    console.log('Cover Public URL:', coverPublicUrl);

    // 4. Get Upload URL (Content Image)
    console.log('\n4. Getting Upload URL for Content Image...');
    const contentImgRes = await request(`${API_URL}/media/upload-url?fileName=content.png&fileType=image/png`);
    const contentImgPublicUrl = contentImgRes.publicUrl;
    console.log('Content Image Upload URL received.');

    // 5. Create Post
    console.log('\n5. Creating Post...');
    const postData = {
      title: 'Test Post ' + uuidv4(),
      content: `<p>This is a test post with an image: <img src="${contentImgPublicUrl}" /></p>`,
      coverImage: coverPublicUrl,
      status: 'published'
    };

    const createRes = await request(`${API_URL}/api/posts`, 'POST', postData, {
      Authorization: `Bearer ${token}`
    });
    const { postId } = createRes;
    console.log(`Post created successfully. ID: ${postId}`);

    // 6. Verify Post
    console.log('\n6. Verifying Post...');
    const posts = await request(`${API_URL}/api/posts`, 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    const post = posts.find(p => p.postId === postId);

    if (post) {
      console.log('Post found in user posts.');
      console.log('Title:', post.title);
      console.log('Cover Image:', post.coverImage);
      console.log('Content:', post.content);
      
      if (post.coverImage === coverPublicUrl && post.content.includes(contentImgPublicUrl)) {
        console.log('\nSUCCESS: Post created with correct data!');
        
        // 7. Verify Public Access
        console.log('\n7. Verifying Public Access to Cover Image...');
        try {
            const imgRes = await fetch(coverPublicUrl, { method: 'HEAD' });
            if (imgRes.ok) {
                console.log('SUCCESS: Cover image is publicly accessible (200 OK).');
            } else {
                console.error(`FAILURE: Cover image access failed with status: ${imgRes.status}`);
            }
        } catch (err) {
            console.error('FAILURE: Could not access cover image:', err.message);
        }

      } else {
        console.error('\nFAILURE: Post data mismatch.');
      }
    } else {
      console.error('\nFAILURE: Post not found.');
    }

  } catch (error) {
    console.error('\nTEST FAILED:', error.message);
  }
}

testCreatePostFlow();
