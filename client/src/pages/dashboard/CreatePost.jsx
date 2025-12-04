import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Wand2, FileText, CheckCircle, X, User, Loader as LoaderIcon } from 'lucide-react';
import { API_URL } from '../../config';
import RichTextEditor from '../../components/RichTextEditor';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';
import CommentSection from '../../components/CommentSection';

const CreatePost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [status, setStatus] = useState('published');
    const [editingPostId, setEditingPostId] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // AI State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiMode, setAiMode] = useState('generate'); // 'generate' or 'improve'
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (location.state && location.state.post) {
            const { post } = location.state;
            setTitle(post.title);
            setContent(post.content);
            setCoverImage(post.coverImage || '');
            setStatus(post.status);
            setEditingPostId(post.postId);
        }
    }, [location.state]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setCoverImage(response.data.imageUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('Failed to upload image', 'error');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSavePost = async (e, postStatus = 'published') => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const postData = { title, content, coverImage, status: postStatus };

            if (editingPostId) {
                await axios.put(`${API_URL}/api/posts/${editingPostId}`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotification('Post updated successfully!', 'success');
            } else {
                await axios.post(`${API_URL}/api/posts`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showNotification('Post created successfully!', 'success');
            }
            navigate('/dashboard/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            showNotification('Failed to save post', 'error');
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setCoverImage('');
        setStatus('published');
        setEditingPostId(null);
        navigate('/dashboard/create', { replace: true, state: {} });
    };

    const openAiGenerateModal = () => {
        setAiMode('generate');
        setAiPrompt('');
        setShowAiModal(true);
    };

    const openAiImproveModal = () => {
        setAiMode('improve');
        setAiPrompt('');
        setShowAiModal(true);
    };

    const handleAiSubmit = async () => {
        if (!aiPrompt.trim()) return;

        setIsAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (aiMode === 'generate') {
                const response = await axios.post(`${API_URL}/ai/generate`,
                    { topic: aiPrompt },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTitle(response.data.title);
                setContent(response.data.content);
                showNotification('Blog post generated successfully!', 'success');
            } else {
                const response = await axios.post(`${API_URL}/ai/improve`,
                    { content, instructions: aiPrompt },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setContent(response.data.content);
                showNotification('Content improved successfully!', 'success');
            }
            setShowAiModal(false);
        } catch (error) {
            console.error('AI Error:', error);
            showNotification('Failed to process AI request. Please check your API key.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2 sm:gap-3">
                            {editingPostId ? 'Edit Post' : 'Create New Post'}
                            {!editingPostId && (
                                <button
                                    onClick={openAiGenerateModal}
                                    className="text-xs sm:text-sm bg-indigo-50 text-indigo-600 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                                >
                                    <Sparkles size={12} className="sm:w-[14px] sm:h-[14px]" />
                                    Auto-Generate
                                </button>
                            )}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">{editingPostId ? 'Update your existing content.' : 'Write and publish your next big idea.'}</p>
                    </div>
                    {editingPostId && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={(e) => handleSavePost(e, 'published')} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field text-lg font-bold"
                            placeholder="Enter post title..."
                            required
                        />
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image
                            {coverImage && <span className="text-xs text-green-600 ml-2">(Uploaded)</span>}
                        </label>
                        <div className="relative group">
                            {coverImage ? (
                                <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setCoverImage('')}
                                            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploadingImage}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        {isUploadingImage ? (
                                            <Loader />
                                        ) : (
                                            <>
                                                <div className="p-3 bg-gray-100 rounded-full">
                                                    <FileText size={24} />
                                                </div>
                                                <p className="font-medium">Click to upload cover image</p>
                                                <p className="text-xs">PNG, JPG up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <button
                                type="button"
                                onClick={openAiImproveModal}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <Wand2 size={12} />
                                Improve with AI
                            </button>
                        </div>
                        <div className="prose-editor-wrapper border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
                            <RichTextEditor content={content} onChange={setContent} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => setShowPreview(true)} className="btn-secondary sm:flex-1 py-2.5 sm:py-2">
                            Preview
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSavePost(e, 'draft')}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 sm:flex-1"
                        >
                            <FileText size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Save Draft</span>
                        </button>
                        <button type="submit" className="btn-primary sm:flex-[2] flex justify-center items-center gap-2 py-2.5 sm:py-3 text-base sm:text-lg">
                            <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                            {editingPostId ? 'Update Post' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[60] animate-fade-in">
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-3 sm:p-4 flex justify-between items-center z-10">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Preview Mode
                            </h3>
                            <button onClick={() => setShowPreview(false)} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-8 md:p-12">
                            <article className="prose prose-sm sm:prose-lg prose-indigo mx-auto">
                                {coverImage && <img src={coverImage} alt={title} className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8" />}
                                <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">{title || 'Untitled Post'}</h1>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User size={12} className="sm:w-[14px] sm:h-[14px]" />
                                        </div>
                                        <span>By You</span>
                                    </div>
                                    <span className="hidden sm:inline">•</span>
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

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[80] animate-fade-in">
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                {aiMode === 'generate' ? (
                                    <>
                                        <Sparkles className="text-indigo-600" size={18} className="sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Auto-Generate Post</span>
                                        <span className="sm:hidden">Generate</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="text-indigo-600" size={18} className="sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Improve Content</span>
                                        <span className="sm:hidden">Improve</span>
                                    </>
                                )}
                            </h3>
                            <button onClick={() => setShowAiModal(false)} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                                {aiMode === 'generate'
                                    ? "Enter a topic or title, and our AI will generate a complete blog post for you."
                                    : "Describe how you want to improve the content (e.g., 'make it funnier', 'fix grammar', 'expand on the second paragraph')."}
                            </p>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={aiMode === 'generate' ? "E.g., The Future of Artificial Intelligence in Healthcare" : "E.g., Make the tone more professional and fix any typos."}
                                className="w-full h-28 sm:h-32 p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400"
                                autoFocus
                            />
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button
                                    onClick={() => setShowAiModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm sm:text-base"
                                    disabled={isAiLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAiSubmit}
                                    disabled={isAiLoading || !aiPrompt.trim()}
                                    className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-sm sm:text-base"
                                >
                                    {isAiLoading ? (
                                        <>
                                            <LoaderIcon className="animate-spin" size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {aiMode === 'generate' ? <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Wand2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                                            {aiMode === 'generate' ? 'Generate' : 'Improve'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
