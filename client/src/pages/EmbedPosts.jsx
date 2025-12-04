import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Calendar, User, ThumbsUp, Share2, MessageSquare, Eye } from 'lucide-react';
import { API_URL, APP_URL } from '../config';

const EmbedPosts = () => {
    const [searchParams] = useSearchParams();
    const apiKey = searchParams.get('apiKey');
    const postId = searchParams.get('postId');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});

    useEffect(() => {
        if (apiKey) {
            fetchPosts();
        } else {
            setError('API Key is required');
            setLoading(false);
        }
    }, [apiKey, postId]);

    useEffect(() => {
        if (postId && posts.length > 0 && posts[0].postId === postId) {
            const trackView = async () => {
                try {
                    await axios.post(`${API_URL}/analytics/track`, {
                        type: 'view',
                        data: { postId, platform: 'web-embed' }
                    });
                } catch (error) {
                    console.error('Error tracking view:', error);
                }
            };
            trackView();
        }
    }, [postId, posts]);

    const fetchPosts = async () => {
        try {
            let data;
            if (postId) {
                const response = await axios.get(`${API_URL}/api/public/posts/${postId}`, {
                    headers: { 'x-cms-api-key': apiKey }
                });
                data = [response.data]; // Wrap single post in array
            } else {
                const response = await axios.get(`${API_URL}/api/public/posts`, {
                    headers: { 'x-cms-api-key': apiKey }
                });
                data = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            setPosts(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Invalid API Key or server error.');
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (likedPosts[postId]) return; // Already liked

        // Optimistic update
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.postId === postId) {
                return {
                    ...post,
                    stats: {
                        ...post.stats,
                        likes: (post.stats?.likes || 0) + 1
                    }
                };
            }
            return post;
        }));
        setLikedPosts(prev => ({ ...prev, [postId]: true }));

        try {
            await axios.post(`${API_URL}/analytics/track`, {
                type: 'like',
                data: { postId, platform: 'web-embed' }
            });
        } catch (error) {
            console.error('Error liking post:', error);
            // Revert optimistic update if needed (optional, keeping simple for now)
        }
    };

    const handleShare = async (postId) => {
        // Optimistic update
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.postId === postId) {
                return {
                    ...post,
                    stats: {
                        ...post.stats,
                        shares: (post.stats?.shares || 0) + 1
                    }
                };
            }
            return post;
        }));

        try {
            await axios.post(`${API_URL}/analytics/track`, {
                type: 'share',
                data: { postId, platform: 'web-embed' }
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
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] p-4 font-sans">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 sm:p-4 text-center text-red-500 font-sans bg-red-50 rounded-lg border border-red-100 text-sm sm:text-base">
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased bg-gray-50 min-h-screen p-2 sm:p-4 md:p-6">
            {postId && posts.length > 0 ? (
                // Single Post View
                <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {posts[0].coverImage && (
                        <img
                            src={posts[0].coverImage}
                            alt={posts[0].title}
                            className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover"
                        />
                    )}
                    <div className="p-4 sm:p-6 md:p-12">
                        <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                            {posts[0].title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <User size={14} className="sm:w-4 sm:h-4" />
                                </div>
                                <span className="font-medium text-gray-900">Author</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                                <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                                <span>{new Date(posts[0].createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                                <Eye size={12} className="sm:w-[14px] sm:h-[14px]" />
                                <span>{posts[0].stats?.views || 0} Views</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                                <MessageSquare size={12} className="sm:w-[14px] sm:h-[14px]" />
                                <span>{posts[0].stats?.comments || 0} Comments</span>
                            </div>
                        </div>
                        <div
                            className="prose prose-sm sm:prose-lg prose-indigo max-w-none text-gray-800 leading-relaxed mb-6 sm:mb-8"
                            dangerouslySetInnerHTML={{ __html: posts[0].content }}
                        />

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100">
                            <button
                                onClick={() => handleLike(posts[0].postId)}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-full transition-colors text-sm sm:text-base ${likedPosts[posts[0].postId] ? 'bg-pink-50 text-pink-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <ThumbsUp size={16} className="sm:w-[18px] sm:h-[18px]" className={likedPosts[posts[0].postId] ? 'fill-current' : ''} />
                                <span className="font-medium">{likedPosts[posts[0].postId] ? 'Liked' : 'Like'} ({posts[0].stats?.likes || 0})</span>
                            </button>
                            <button
                                onClick={() => handleShare(posts[0].postId)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm sm:text-base"
                            >
                                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="font-medium">Share ({posts[0].stats?.shares || 0})</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // List View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {posts.map((post) => (
                        <div key={post.postId} className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group">
                            {post.coverImage ? (
                                <div className="h-40 sm:h-48 overflow-hidden relative">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center text-gray-300 relative">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    </div>
                                </div>
                            )}
                            <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    <a href={`?apiKey=${apiKey}&postId=${post.postId}`}>
                                        {post.title}
                                    </a>
                                </h3>
                                <div
                                    className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 h-8 sm:h-10 prose prose-sm"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                                <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 flex flex-col gap-3 sm:gap-4">
                                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
                                        <span className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors" title="Author">
                                                <User size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="hidden sm:inline">Author</span>
                                            </span>
                                            <span className="flex items-center gap-1" title="Views">
                                                <Eye size={12} className="sm:w-[14px] sm:h-[14px]" /> {post.stats?.views || 0}
                                            </span>
                                            <span className="flex items-center gap-1" title="Comments">
                                                <MessageSquare size={12} className="sm:w-[14px] sm:h-[14px]" /> {post.stats?.comments || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => handleLike(post.postId)}
                                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${likedPosts[post.postId] ? 'bg-pink-50 text-pink-600' : 'text-gray-600 bg-gray-50 hover:bg-pink-50 hover:text-pink-600'}`}
                                        >
                                            <ThumbsUp size={12} className="sm:w-[14px] sm:h-[14px]" className={likedPosts[post.postId] ? 'fill-current' : ''} />
                                            <span className="hidden sm:inline">{likedPosts[post.postId] ? 'Liked' : 'Like'}</span> ({post.stats?.likes || 0})
                                        </button>
                                        <button
                                            onClick={() => handleShare(post.postId)}
                                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                        >
                                            <Share2 size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="hidden sm:inline">Share</span> ({post.stats?.shares || 0})
                                        </button>
                                        <a
                                            href={`?apiKey=${apiKey}&postId=${post.postId}`}
                                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                        >
                                            <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" /> Read
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="col-span-full text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare size={24} className="sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">No posts yet</h3>
                            <p className="text-sm sm:text-base text-gray-500 mt-1">Check back later for new content.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="text-center py-4 sm:py-6 mt-6 sm:mt-8">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                    <span>Powered by</span>
                    <span className="font-bold text-gray-900">Blog ERP</span>
                </a>
            </div>
        </div>
    );
};

export default EmbedPosts;
