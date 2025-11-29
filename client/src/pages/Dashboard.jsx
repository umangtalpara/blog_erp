import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditor from '../components/RichTextEditor';
import CommentSection from '../components/CommentSection';
import Loader from '../components/Loader';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { LogOut, Plus, Key, Trash2, LayoutDashboard, FileText, Settings, Menu, X, User, Edit2, CheckCircle, AlertCircle, BarChart2, Share2, MessageSquare, Eye, Code, Share, ThumbsUp } from 'lucide-react';
import { API_URL, APP_URL } from '../config';


const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [status, setStatus] = useState('published');
    const [editingPostId, setEditingPostId] = useState(null);

    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedPostForEmbed, setSelectedPostForEmbed] = useState(null);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [postStats, setPostStats] = useState({});
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    const getActiveView = () => {
        const path = location.pathname;
        if (path.includes('/dashboard/analytics')) return 'analytics';
        if (path.includes('/dashboard/posts')) return 'posts';
        if (path.includes('/dashboard/integrations')) return 'integrations';
        if (path.includes('/dashboard/create')) return 'create';
        return 'dashboard';
    };

    const activeView = getActiveView();

    const [analyticsStats, setAnalyticsStats] = useState({});

    useEffect(() => {
        fetchApiKeys();
        fetchPosts();
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/analytics/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyticsStats(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchApiKeys = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api-keys`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiKeys(response.data);
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    };

    const fetchPosts = async () => {
        setIsLoadingPosts(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort posts by createdAt desc
            const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(sortedPosts);
            fetchPostStats();
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const fetchPostStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/analytics/posts`);
            setPostStats(response.data);
        } catch (error) {
            console.error('Error fetching post stats:', error);
        }
    };

    const createApiKey = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api-keys`, { name: newKeyName || 'New Key' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewKeyName('');
            fetchApiKeys();
        } catch (error) {
            console.error('Error creating API key:', error);
        }
    };

    const deleteApiKey = async (apiKey) => {
        if (!window.confirm('Are you sure you want to delete this key?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api-keys/${apiKey}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchApiKeys();
        } catch (error) {
            console.error('Error deleting API key:', error);
        }
    };

    const handleSavePost = async (e, postStatus = 'published') => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingPostId) {
                await axios.put(`${API_URL}/api/posts/${editingPostId}`, { title, content, coverImage, status: postStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotification('Post updated successfully!', 'success');
            } else {
                await axios.post(`${API_URL}/api/posts`, { title, content, coverImage, status: postStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotification('Post created successfully!', 'success');
            }
            resetForm();
            fetchPosts();
            navigate('/dashboard/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            showNotification('Failed to save post', 'error');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEditClick = (post) => {
        setTitle(post.title);
        setContent(post.content);
        setCoverImage(post.coverImage);
        setStatus(post.status || 'published');
        setEditingPostId(post.postId);
        navigate('/dashboard/create');
    };

    const handleShareClick = (post) => {
        setSelectedPostForEmbed(post);
        setShowEmbedModal(true);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setCoverImage('');
        setStatus('published');
        setEditingPostId(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const { data } = await axios.get(`${API_URL}/media/upload-url?fileName=${file.name}&fileType=${file.type}`);
            await axios.put(data.url, file, { headers: { 'Content-Type': file.type } });
            setCoverImage(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('Failed to upload cover image. Please try again.', 'error');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('username');
        navigate('/');
    };

    const handlePreviewClick = async () => {
        setShowPreview(true);
        // Track view event
        try {
            await axios.post(`${API_URL}/analytics/track`, {
                type: 'view',
                data: {
                    postId: editingPostId || 'preview-post',
                    platform: 'web'
                }
            });
            fetchAnalytics(); // Refresh stats
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const handleCardPreview = async (post) => {
        setTitle(post.title);
        setContent(post.content);
        setCoverImage(post.coverImage);
        setEditingPostId(post.postId);
        setShowPreview(true);

        // Track view event
        try {
            await axios.post(`${API_URL}/analytics/track`, {
                type: 'view',
                data: {
                    postId: post.postId,
                    platform: 'web'
                }
            });
            fetchAnalytics(); // Refresh stats
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const SidebarItem = ({ view, icon: Icon, label }) => (
        <button
            onClick={() => {
                if (view === 'create') resetForm();
                navigate(view === 'dashboard' ? '/dashboard' : `/dashboard/${view}`);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeView === view
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">B</div>
                        <span className="text-xl font-bold text-gray-900 font-heading">Blog ERP</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 px-4 py-6 space-y-2">
                        <SidebarItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem view="analytics" icon={BarChart2} label="Analytics" />
                        <SidebarItem view="posts" icon={FileText} label="My Posts" />
                        <SidebarItem view="integrations" icon={Code} label="Integrations" />
                        <SidebarItem view="create" icon={Plus} label="Create New Post" />
                    </div>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{localStorage.getItem('username') || 'User'}</p>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-gray-900">Blog ERP</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto animate-fade-in">
                        {/* View: Dashboard (Info & Keys) */}
                        {activeView === 'dashboard' && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                    <p className="text-gray-500 mt-1">Manage your API keys and account settings.</p>
                                </div>

                                {/* Stats Cards (Placeholder) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="card p-6 flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Posts</p>
                                            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                                        </div>
                                    </div>
                                    <div className="card p-6 flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                            <Key size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Active API Keys</p>
                                            <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* API Keys Section */}
                                <div className="card">
                                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
                                            <p className="text-sm text-gray-500">Manage access keys for your content API.</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <input
                                                type="text"
                                                placeholder="Key Name"
                                                value={newKeyName}
                                                onChange={(e) => setNewKeyName(e.target.value)}
                                                className="input-field w-full sm:w-48"
                                            />
                                            <button onClick={createApiKey} className="btn-primary whitespace-nowrap flex items-center gap-2">
                                                <Plus size={18} />
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {apiKeys.map((key) => (
                                            <div key={key.apiKey} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                                                        <Key size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{key.name}</p>
                                                        <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{key.apiKey}</code>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400 hidden sm:inline">Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                                                    <button onClick={() => deleteApiKey(key.apiKey)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {apiKeys.length === 0 && (
                                            <div className="p-8 text-center text-gray-500">
                                                No API keys found. Generate one to get started.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View: Analytics */}
                        {activeView === 'analytics' && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                                    <p className="text-gray-500 mt-1">Track engagement and activity on your blog.</p>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="card p-6 flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                            <Eye size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Views</p>
                                            <p className="text-2xl font-bold text-gray-900">{analyticsStats.totalViews || 0}</p>
                                        </div>
                                    </div>
                                    <div className="card p-6 flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                            <Share2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Shares</p>
                                            <p className="text-2xl font-bold text-gray-900">{analyticsStats.totalShares || 0}</p>
                                        </div>
                                    </div>
                                    <div className="card p-6 flex items-center gap-4">
                                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Comments</p>
                                            <p className="text-2xl font-bold text-gray-900">{analyticsStats.totalComments || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Log */}
                                <div className="card">
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {analyticsStats.recentActivity && analyticsStats.recentActivity.length > 0 ? (
                                            analyticsStats.recentActivity.map((log) => (
                                                <div key={log.eventId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${log.type === 'share' ? 'bg-blue-50 text-blue-600' :
                                                            log.type === 'comment' ? 'bg-green-50 text-green-600' :
                                                                'bg-purple-50 text-purple-600'
                                                            }`}>
                                                            {log.type === 'share' ? <Share2 size={18} /> :
                                                                log.type === 'comment' ? <MessageSquare size={18} /> :
                                                                    <Eye size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {log.type === 'share' ? 'Post Shared' :
                                                                    log.type === 'comment' ? 'New Comment' :
                                                                        'Post Viewed'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {log.postId ? `Post ID: ${log.postId}` : 'Unknown Post'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                No activity recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View: My Posts */}
                        {activeView === 'posts' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
                                        <p className="text-gray-500 mt-1">Manage and view your published content.</p>
                                    </div>
                                    <button onClick={() => { resetForm(); navigate('/dashboard/create'); }} className="btn-primary flex items-center gap-2">
                                        <Plus size={18} />
                                        New Post
                                    </button>
                                </div>

                                {isLoadingPosts ? (
                                    <div className="flex justify-center items-center py-20">
                                        <Loader size="large" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {posts.map((post) => (
                                            <div key={post.postId} className="card group hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                                {post.coverImage ? (
                                                    <div className="h-48 overflow-hidden relative">
                                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute top-2 right-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {post.status === 'published' ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300 relative">
                                                        <FileText size={48} />
                                                        <div className="absolute top-2 right-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {post.status === 'published' ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                                    <div className="text-gray-500 text-sm mb-4 line-clamp-2 h-10" dangerouslySetInnerHTML={{ __html: post.content }} />
                                                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors" title="Views">
                                                                    <Eye size={14} /> {postStats[post.postId]?.views || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="Shares">
                                                                    <Share2 size={14} /> {postStats[post.postId]?.shares || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 hover:text-pink-600 transition-colors" title="Likes">
                                                                    <ThumbsUp size={14} /> {postStats[post.postId]?.likes || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 hover:text-green-600 transition-colors" title="Comments">
                                                                    <MessageSquare size={14} /> {postStats[post.postId]?.comments || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                                            <button onClick={() => handleCardPreview(post)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors" title="Preview">
                                                                <Eye size={14} /> Preview
                                                            </button>
                                                            <button onClick={() => handleShareClick(post)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Share / Embed">
                                                                <Share size={14} /> Share
                                                            </button>
                                                            <button onClick={() => handleEditClick(post)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                                                                <Edit2 size={14} /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeletePost(post.postId)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {posts.length === 0 && (
                                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FileText size={32} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                                                <p className="text-gray-500 mt-1 mb-6">Start writing your first blog post today.</p>
                                                <button onClick={() => { resetForm(); navigate('/dashboard/create'); }} className="btn-primary">
                                                    Create Post
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* View: Integrations */}
                        {activeView === 'integrations' && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                                    <p className="text-gray-500 mt-1">Connect your blog content with other applications and websites.</p>
                                </div>

                                <div className="grid gap-6">
                                    {/* REST API */}
                                    <div className="card p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                                <Settings size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">REST API</h2>
                                                <p className="text-sm text-gray-500">Fetch your content programmatically using our JSON API.</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                            <code className="text-sm text-gray-300 font-mono">
                                                <span className="text-purple-400">GET</span> {API_URL}/api/public/posts<br />
                                                <span className="text-gray-500">Headers:</span><br />
                                                x-cms-api-key: {apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}
                                            </code>
                                        </div>
                                    </div>

                                    {/* JavaScript Embed */}
                                    <div className="card p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                                                <Code size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">JavaScript Embed</h2>
                                                <p className="text-sm text-gray-500">Copy and paste this snippet to show posts on any website.</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative group">
                                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                                {`<!-- Container for posts -->
<div class="blog-erp-embed" data-api-key="${apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}"></div>

<!-- Load Script -->
<script src="${APP_URL}/embed.js" async></script>`}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* iFrame Embed */}
                                    <div className="card p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                                <LayoutDashboard size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">iFrame Widget</h2>
                                                <p className="text-sm text-gray-500">Embed a ready-made widget directly into your page.</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                                {`<iframe 
  src="${APP_URL}/embed?apiKey=${apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}"
  width="100%" 
  height="600" 
  frameborder="0"
></iframe>`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View: Create/Edit Post */}
                        {activeView === 'create' && (
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{editingPostId ? 'Edit Post' : 'Create New Post'}</h1>
                                        <p className="text-gray-500 mt-1">{editingPostId ? 'Update your existing content.' : 'Write and publish your next big idea.'}</p>
                                    </div>
                                    {editingPostId && (
                                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>

                                <div className="card p-6 sm:p-8">
                                    <form onSubmit={(e) => handleSavePost(e, 'published')} className="space-y-8">
                                        {/* Title Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full px-4 py-3 text-xl font-semibold text-gray-900 placeholder-gray-400 border-b-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors bg-transparent"
                                                placeholder="Enter a captivating title..."
                                                required
                                            />
                                        </div>

                                        {/* Cover Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                                            <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 hover:bg-gray-50 transition-all cursor-pointer relative group">
                                                <div className="space-y-1 text-center">
                                                    {coverImage ? (
                                                        <div className="relative">
                                                            <img src={coverImage} alt="Cover" className="mx-auto h-64 object-cover rounded-lg shadow-md" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                                <p className="text-white font-medium">Click to change</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-4">
                                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                                <Plus size={24} />
                                                            </div>
                                                            <div className="flex text-sm text-gray-600">
                                                                <span className="relative cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                                    <span>Upload a file</span>
                                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} />
                                                                </span>
                                                                <p className="pl-1">or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                            {isUploadingImage && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader />
                                                        <span className="text-sm font-medium text-gray-600">Uploading...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rich Text Editor */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                            <div className="prose-editor-wrapper border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
                                                <RichTextEditor content={content} onChange={setContent} />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                            <button type="button" onClick={() => handlePreviewClick()} className="btn-secondary flex-1">
                                                Preview
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleSavePost(e, 'draft')}
                                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 flex-1"
                                            >
                                                <FileText size={20} />
                                                Save Draft
                                            </button>
                                            <button type="submit" className="btn-primary flex-[2] flex justify-center items-center gap-2 py-3 text-lg">
                                                <CheckCircle size={20} />
                                                {editingPostId ? 'Update Post' : 'Publish Post'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Preview Mode
                            </h3>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 md:p-12">
                            <article className="prose prose-lg prose-indigo mx-auto">
                                {coverImage && <img src={coverImage} alt={title} className="w-full h-[400px] object-cover rounded-2xl shadow-lg mb-8" />}
                                <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{title || 'Untitled Post'}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User size={14} />
                                        </div>
                                        <span>By You</span>
                                    </div>
                                    <span>•</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">Start writing your content...</p>' }} />
                            </article>

                            {/* Comment Section */}
                            <CommentSection postId={editingPostId || 'preview-post'} />
                        </div>
                    </div>
                </div>
            )}

            {/* Embed Modal */}
            {showEmbedModal && selectedPostForEmbed && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Share size={20} className="text-indigo-600" />
                                Embed Post: {selectedPostForEmbed.title}
                            </h3>
                            <button onClick={() => setShowEmbedModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                                Use the snippets below to display this specific post on your website.
                            </div>

                            {/* REST API */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Settings size={16} /> REST API
                                </h4>
                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                    <code className="text-sm text-gray-300 font-mono">
                                        <span className="text-purple-400">GET</span> {API_URL}/api/public/posts/{selectedPostForEmbed.postId}<br />
                                        <span className="text-gray-500">Headers:</span><br />
                                        x-cms-api-key: {apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}
                                    </code>
                                </div>
                            </div>

                            {/* JavaScript Embed */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Code size={16} /> JavaScript Embed
                                </h4>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <LayoutDashboard size={16} /> iFrame Widget
                                    </h4>
                                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                            {`<iframe 
  src="${APP_URL}/embed?apiKey=${apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}&postId=${selectedPostForEmbed.postId}"
  width="100%" 
  height="600" 
  frameborder="0"
></iframe>`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
