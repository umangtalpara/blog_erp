(function() {
    const API_BASE_URL = 'http://localhost:5000'; // Adjust if deployed

    function init() {
        const containers = document.querySelectorAll('.blog-erp-embed');
        
        containers.forEach(container => {
            const apiKey = container.getAttribute('data-api-key');
            if (!apiKey) {
                container.innerHTML = '<p style="color: red;">Error: Missing API Key</p>';
                return;
            }
            loadPosts(container, apiKey);
        });
    }

    async function loadPosts(container, apiKey) {
        try {
            const postId = container.getAttribute('data-post-id');
            
            // Add basic styles
            const style = document.createElement('style');
            style.textContent = `
                .blog-erp-post { border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px; font-family: sans-serif; background: #fff; }
                .blog-erp-post h3 { margin-top: 0; color: #333; }
                .blog-erp-post a { text-decoration: none; color: inherit; }
                .blog-erp-post a:hover { color: #4f46e5; }
                .blog-erp-meta { font-size: 0.8em; color: #888; margin-top: 10px; }
                .blog-erp-post img { max-width: 100%; height: auto; border-radius: 4px; }
                .blog-erp-content { margin-top: 10px; line-height: 1.6; }
            `;
            document.head.appendChild(style);

            container.innerHTML = '<p>Loading posts...</p>';

            let url = `${API_BASE_URL}/api/public/posts`;
            if (postId) {
                url += `/${postId}`;
            }

            const response = await fetch(url, {
                headers: { 'x-cms-api-key': apiKey }
            });

            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();
            const posts = Array.isArray(data) ? data : [data];
            
            if (posts.length === 0) {
                container.innerHTML = '<p>No posts found.</p>';
                return;
            }

            const html = posts.map(post => `
                <div class="blog-erp-post">
                    ${post.coverImage ? `<img src="${post.coverImage}" alt="${escapeHtml(post.title)}" style="width: 100%; max-height: 300px; object-fit: cover; margin-bottom: 15px;">` : ''}
                    <h3><a href="#">${escapeHtml(post.title)}</a></h3>
                    <div class="blog-erp-content">${post.content}</div>
                    <div class="blog-erp-meta">
                        ${new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </div>
            `).join('');

            container.innerHTML = html;

        } catch (error) {
            console.error('Blog ERP Embed Error:', error);
            container.innerHTML = '<p style="color: red;">Error loading posts.</p>';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
