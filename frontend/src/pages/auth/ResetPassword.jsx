import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';

const ResetPassword = ({ setCurrentPage }) => {
    const { API_URL } = useAuth();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Extract token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');

        // Also check if token is in the path (e.g., /reset-password/token)
        const pathParts = window.location.pathname.split('/');
        const pathToken = pathParts[pathParts.length - 1];

        const extractedToken = urlToken || (pathToken !== 'reset-password' ? pathToken : '');

        if (extractedToken) {
            setToken(extractedToken);
        } else {
            setError('Invalid or missing reset token');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    setCurrentPage('login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-200 via-red-200 to-red-300">

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-0 text-6xl opacity-20 transform rotate-12 animate-pulse">🔐</div>
                <div className="absolute top-32 right-20 text-4xl opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>🔑</div>
                <div className="absolute bottom-40 left-16 text-5xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}>🛡️</div>
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Reset Password Card */}
            <div className="relative max-w-lg z-10 w-full mx-4">
                <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-200 border-opacity-40 p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
                            <ChefHat className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
                        <p className="text-gray-600 text-sm">Enter your new password below</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl backdrop-blur-sm border bg-green-100 bg-opacity-80 border-green-300 text-green-700 text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <CheckCircle size={18} />
                                <p>{message}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl backdrop-blur-sm border bg-red-100 bg-opacity-80 border-red-300 text-red-700 text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <AlertCircle size={18} />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* New Password Field */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative w-full">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20 p-0 flex items-center justify-center"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative w-full">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20 p-0 flex items-center justify-center"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg border-none cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center justify-center">
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Resetting Password...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* Footer Link */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setCurrentPage('login')}
                            className="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
