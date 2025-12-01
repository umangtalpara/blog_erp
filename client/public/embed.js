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
            // Check URL params first, then data attribute
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('postId') || container.getAttribute('data-post-id');
            
            // Add basic styles
            const style = document.createElement('style');
            style.textContent = `
                .blog-erp-grid {
                    display: grid;
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                    gap: 1.5rem;
                    padding: 1rem;
                }
                @media (min-width: 768px) {
                    .blog-erp-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (min-width: 1024px) {
                    .blog-erp-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
                .blog-erp-post { 
                    background-color: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .blog-erp-post:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .blog-erp-image-container {
                    height: 12rem;
                    overflow: hidden;
                    position: relative;
                    background-color: #f3f4f6;
                }
                .blog-erp-post img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                    transition: transform 0.5s ease;
                }
                .blog-erp-post:hover img {
                    transform: scale(1.05);
                }
                .blog-erp-placeholder-icon {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d1d5db;
                }
                .blog-erp-content-wrapper {
                    padding: 1.25rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .blog-erp-post h3 { 
                    margin: 0 0 0.5rem 0; 
                    font-size: 1.125rem;
                    line-height: 1.75rem;
                    font-weight: 700;
                    color: #111827; 
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-erp-post h3 a {
                    text-decoration: none;
                    color: inherit;
                    transition: color 0.2s;
                }
                .blog-erp-post:hover h3 a {
                    color: #4f46e5;
                }
                .blog-erp-content { 
                    color: #6b7280; 
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    margin-bottom: 1rem; 
                    height: 2.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .blog-erp-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid #f3f4f6;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .blog-erp-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .blog-erp-author {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }
                .blog-erp-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #f9fafb;
                }
                .blog-erp-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                .blog-erp-btn-like {
                    background-color: #f9fafb;
                    color: #4b5563;
                }
                .blog-erp-btn-like:hover {
                    background-color: #fdf2f8;
                    color: #db2777;
                }
                .blog-erp-btn-like.liked {
                    background-color: #fdf2f8;
                    color: #db2777;
                }
                .blog-erp-btn-share {
                    background-color: #f9fafb;
                    color: #4b5563;
                }
                .blog-erp-btn-share:hover {
                    background-color: #eff6ff;
                    color: #2563eb;
                }
                .blog-erp-btn-read {
                    background-color: #f9fafb;
                    color: #4b5563;
                }
                .blog-erp-btn-read:hover {
                    background-color: #eef2ff;
                    color: #4f46e5;
                }
                .blog-erp-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background-color: #f3f4f6;
                    color: #4b5563;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 1rem;
                    transition: background-color 0.2s;
                }
                .blog-erp-back-btn:hover {
                    background-color: #e5e7eb;
                }
                .blog-erp-powered {
                    text-align: center;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                }
                .blog-erp-powered a {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #fff;
                    border: 1px solid #f3f4f6;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    color: #6b7280;
                    text-decoration: none;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    transition: color 0.2s;
                }
                .blog-erp-powered a:hover {
                    color: #4f46e5;
                }
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
                container.innerHTML = `
                    <div style="text-align: center; padding: 4rem 0; background: white; border-radius: 1rem; border: 2px dashed #e5e7eb;">
                        <div style="width: 4rem; height: 4rem; background: #f9fafb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin: 0;">No posts yet</h3>
                        <p style="color: #6b7280; margin-top: 0.25rem;">Check back later for new content.</p>
                    </div>
                `;
                return;
            }

            const postsHtml = posts.map(post => `
                <div class="blog-erp-post">
                    <div class="blog-erp-image-container">
                        ${post.coverImage ? 
                            `<img src="${post.coverImage}" alt="${escapeHtml(post.title)}">` : 
                            `<div class="blog-erp-placeholder-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>`}
                    </div>
                    <div class="blog-erp-content-wrapper">
                        <h3><a href="?apiKey=${apiKey}&postId=${post.postId}">${escapeHtml(post.title)}</a></h3>
                        <div class="blog-erp-content" style="${postId ? 'height: auto; -webkit-line-clamp: unset;' : ''}">${post.content}</div>
                        
                        <div class="blog-erp-footer">
                            <div class="blog-erp-meta">
                                <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                                <span class="blog-erp-author">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    Author
                                </span>
                            </div>
                            <div class="blog-erp-actions">
                                <button class="blog-erp-btn blog-erp-btn-like like-btn" data-post-id="${post.postId}" data-likes="${post.stats?.likes || 0}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                    <span>Like (${post.stats?.likes || 0})</span>
                                </button>
                                <button class="blog-erp-btn blog-erp-btn-share share-btn" data-post-id="${post.postId}" data-shares="${post.stats?.shares || 0}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                    <span>Share (${post.stats?.shares || 0})</span>
                                </button>
                                ${!postId ? `
                                <a href="?apiKey=${apiKey}&postId=${post.postId}" class="blog-erp-btn blog-erp-btn-read read-btn" data-post-id="${post.postId}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                    Read
                                </a>` : ''}
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af; text-align: right;">
                                <span class="view-count" style="margin-right: 0.5rem;">${post.stats?.views || 0} Views</span>
                                <span class="comment-count">${post.stats?.comments || 0} Comments</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                ${postId ? `<a href="?apiKey=${apiKey}" class="blog-erp-back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to all posts
                </a>` : ''}
                <div class="blog-erp-grid" style="${postId ? 'grid-template-columns: 1fr;' : ''}">
                    ${postsHtml}
                </div>
                <div class="blog-erp-powered">
                    <a href="${API_BASE_URL.replace('5000', '5173')}" target="_blank" rel="noopener noreferrer">
                        Powered by <strong>Blog ERP</strong>
                    </a>
                </div>
            `;

            // Add event listeners
            container.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = btn.getAttribute('data-post-id');
                    if (btn.classList.contains('liked')) return;

                    // Optimistic update
                    let currentLikes = parseInt(btn.getAttribute('data-likes') || '0');
                    const newLikes = currentLikes + 1;
                    btn.setAttribute('data-likes', newLikes);
                    btn.querySelector('span').textContent = `Liked (${newLikes})`;
                    btn.classList.add('liked');
                    btn.querySelector('svg').style.fill = 'currentColor';

                    try {
                        await fetch(`${API_BASE_URL}/analytics/track`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'like',
                                data: { postId, platform: 'js-embed' }
                            })
                        });
                    } catch (err) {
                        console.error('Error liking post:', err);
                        // Revert if needed
                    }
                });
            });

            container.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = btn.getAttribute('data-post-id');
                    
                    // Optimistic update
                    let currentShares = parseInt(btn.getAttribute('data-shares') || '0');
                    const newShares = currentShares + 1;
                    btn.setAttribute('data-shares', newShares);
                    btn.querySelector('span').textContent = `Share (${newShares})`;

                    try {
                        await fetch(`${API_BASE_URL}/analytics/track`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'share',
                                data: { postId, platform: 'js-embed' }
                            })
                        });
                        
                        if (navigator.share) {
                            await navigator.share({
                                title: 'Check out this post',
                                url: window.location.href
                            });
                        } else {
                            await navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }
                    } catch (err) {
                        console.error('Error sharing post:', err);
                    }
                });
            });

            container.querySelectorAll('.read-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = btn.getAttribute('data-post-id');
                    try {
                        // Use keepalive to ensure request completes even if page unloads
                        await fetch(`${API_BASE_URL}/analytics/track`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'view',
                                data: { postId, platform: 'js-embed' }
                            }),
                            keepalive: true
                        });
                    } catch (err) {
                        console.error('Error tracking view:', err);
                    }
                });
            });

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
