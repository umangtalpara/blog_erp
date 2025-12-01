import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code, LayoutDashboard, Settings } from 'lucide-react';
import { API_URL, APP_URL } from '../../config';

const Integrations = () => {
    const [apiKeys, setApiKeys] = useState([]);

    useEffect(() => {
        fetchApiKeys();
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

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                <p className="text-gray-500 mt-1">Connect your blog to your website or app.</p>
            </div>

            <div className="card p-6 space-y-8">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                    Use the snippets below to display your blog posts on your website. Replace <code className="bg-blue-100 px-1 rounded">YOUR_API_KEY</code> with one of your active keys.
                </div>

                {/* REST API */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings size={20} /> REST API
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                        <code className="text-sm text-gray-300 font-mono">
                            <span className="text-purple-400">GET</span> {API_URL}/api/public/posts<br />
                            <span className="text-gray-500">Headers:</span><br />
                            x-cms-api-key: {apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}
                        </code>
                    </div>
                </div>

                {/* JavaScript Embed */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Code size={20} /> JavaScript Embed
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                            {`<div id="blog-container" data-api-key="${apiKeys.length > 0 ? apiKeys[0].apiKey : 'YOUR_API_KEY'}"></div>
<script src="${APP_URL}/embed.js"></script>`}
                        </pre>
                    </div>
                </div>

                {/* iFrame Widget */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <LayoutDashboard size={20} /> iFrame Widget
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
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
    );
};

export default Integrations;
