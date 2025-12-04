import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin ? { email, password } : { email, password, username };

        try {
            const res = await axios.post(`${API_URL}${endpoint}`, payload);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('apiKey', res.data.apiKey);
            if (res.data.username) {
                localStorage.setItem('username', res.data.username);
            }
            navigate('/dashboard');
        } catch (error) {
            showNotification(error.response?.data?.error || 'An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
                <div className="relative z-10 text-white p-12 text-center">
                    <h1 className="text-5xl font-bold mb-6">Blog ERP</h1>
                    <p className="text-xl text-indigo-100 max-w-md mx-auto">
                        Manage your content, API keys, and media all in one beautiful place.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in">
                <div className="w-full max-w-md space-y-6 sm:space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isLogin ? 'Please enter your details to sign in.' : 'Get started with your free account today.'}
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="input-field mt-1"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field mt-1"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field mt-1"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex justify-center py-2.5 text-sm sm:text-base"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    isLogin ? 'Sign in' : 'Create account'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                {isLogin ? 'Sign up for free' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
