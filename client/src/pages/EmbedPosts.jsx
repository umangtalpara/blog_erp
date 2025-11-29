import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { API_URL, APP_URL } from '../config';


const EmbedPosts = () => {
    const [searchParams] = useSearchParams();
    const apiKey = searchParams.get('apiKey');
    const postId = searchParams.get('postId');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (apiKey) {
            fetchPosts();
        } else {
            setError('API Key is required');
            setLoading(false);
        }
    }, [apiKey, postId]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] p-4 font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 font-sans bg-red-50 rounded-lg border border-red-100">
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased bg-white min-h-screen">
            {postId && posts.length > 0 ? (
                // Single Post View
                <div className="max-w-4xl mx-auto p-6 md:p-12">
                    <article className="prose prose-lg prose-indigo mx-auto">
                        {posts[0].coverImage && (
                            <img
                                src={posts[0].coverImage}
                                alt={posts[0].title}
                                className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl shadow-lg mb-8"
                            />
                        )}
                        <h1 className="font-heading text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {posts[0].title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <User size={16} />
                                </div>
                                <span className="font-medium text-gray-900">Author</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date(posts[0].createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                        <div
                            className="text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: posts[0].content }}
                        />
                    </article>
                </div>
            ) : (
                // List View
                <div className="grid gap-6 p-4">
                    {posts.map((post) => (
                        <article key={post.postId} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row h-full sm:h-48">
                            {post.coverImage && (
                                <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1 justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                                        <a href={`?apiKey=${apiKey}&postId=${post.postId}`} className="hover:underline decoration-2 underline-offset-2 decoration-indigo-200">
                                            {post.title}
                                        </a>
                                    </h2>
                                    <div
                                        className="text-gray-600 text-sm line-clamp-2 mb-4 prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            Author
                                        </span>
                                    </div>
                                    <a href={`?apiKey=${apiKey}&postId=${post.postId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1 group">
                                        Read more
                                        <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No published posts found.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="text-center py-4 border-t border-gray-100 mt-4 bg-gray-50">
                <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium flex items-center justify-center gap-1">
                    Powered by <span className="font-bold">Blog ERP</span>
                </a>
            </div>
        </div>
    );
};

export default EmbedPosts;
