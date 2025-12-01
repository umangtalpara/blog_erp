import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Key, Plus, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

const DashboardHome = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [postsCount, setPostsCount] = useState(0);
    const [newKeyName, setNewKeyName] = useState('');

    useEffect(() => {
        fetchApiKeys();
        fetchPostsCount();
    }, []);

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

    const fetchPostsCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPostsCount(response.data.length);
        } catch (error) {
            console.error('Error fetching posts count:', error);
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

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage your API keys and account settings.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">{postsCount}</p>
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
    );
};

export default DashboardHome;
