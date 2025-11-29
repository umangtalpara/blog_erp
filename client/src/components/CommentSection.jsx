import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User } from 'lucide-react';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/analytics/comments/${postId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/analytics/track', {
                type: 'comment',
                data: {
                    postId,
                    content: newComment,
                    author: 'Anonymous' // In a real app, this would be the logged-in user
                }
            });
            setNewComment('');
            fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare size={20} />
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none h-24"
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                                {loading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.eventId} className="flex gap-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                                {comment.author ? comment.author[0].toUpperCase() : 'A'}
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900">{comment.author || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
