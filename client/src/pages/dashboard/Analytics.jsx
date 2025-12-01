import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Share2, MessageSquare, ThumbsUp } from 'lucide-react';
import { API_URL } from '../../config';

const Analytics = () => {
    const [analyticsStats, setAnalyticsStats] = useState({});

    useEffect(() => {
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

    return (
        <div className="space-y-8 animate-fade-in">
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
                                            log.type === 'like' ? 'bg-pink-50 text-pink-600' :
                                                'bg-purple-50 text-purple-600'
                                        }`}>
                                        {log.type === 'share' ? <Share2 size={18} /> :
                                            log.type === 'comment' ? <MessageSquare size={18} /> :
                                                log.type === 'like' ? <ThumbsUp size={18} /> :
                                                    <Eye size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {log.type === 'share' ? 'Post Shared' :
                                                log.type === 'comment' ? 'New Comment' :
                                                    log.type === 'like' ? 'Post Liked' :
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
    );
};

export default Analytics;
