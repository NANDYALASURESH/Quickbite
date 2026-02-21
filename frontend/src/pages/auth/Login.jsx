import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ChefHat, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import RoleSelectionModal from '../../components/RoleSelectionModal';
import ForgotPassword from '../../components/ForgotPassword';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; // Add this to your .env file

const Login = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingCredential, setPendingCredential] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const sampleAccounts = [
    { role: 'admin', email: 'admin@quickbite.com', password: 'password123', label: 'Admin', icon: '🛡️', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { role: 'owner', email: 'owner@quickbite.com', password: 'password123', label: 'Owner', icon: '👨‍🍳', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { role: 'delivery', email: 'delivery@quickbite.com', password: 'password123', label: 'Delivery', icon: '🏍️', color: 'bg-green-100 text-green-700 border-green-200' },
    { role: 'user', email: 'customer@quickbite.com', password: 'password123', label: 'Customer', icon: '🛍️', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  ];

  const handleSampleLogin = (account) => {
    setFormData({ email: account.email, password: account.password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    if (result.success) {
      setCurrentPage('home');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // First, try to login without role (for existing users)
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          // Don't send role for existing users
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Existing user - login directly
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage('home');
      } else if (data.requiresRole || (data.message && data.message.includes('Role selection required'))) {
        // New user - show role selection modal
        setPendingCredential(credentialResponse.credential);
        setShowRoleModal(true);
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(`Failed to login with Google: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: pendingCredential,
          role: selectedRole
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Trigger auth state update and redirect
        setCurrentPage('home');
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
      setPendingCredential(null);
      setShowRoleModal(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <>
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setPendingCredential(null);
        }}
        onSelectRole={handleRoleSelect}
      />
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-200 via-red-200 to-red-300">

          {/* Food delivery themed background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-0 text-6xl opacity-20 transform rotate-12 animate-pulse">🚚</div>
            <div className="absolute top-32 right-20 text-4xl opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>🍕</div>
            <div className="absolute bottom-40 left-16 text-5xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}>🍔</div>
            <div className="absolute top-60 left-10 text-3xl opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>🍟</div>
            <div className="absolute bottom-32 right-32 text-4xl opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}>🌮</div>
            <div className="absolute top-80 right-10 text-3xl opacity-30 animate-bounce" style={{ animationDelay: '2.5s' }}>📦</div>
            <div className="absolute bottom-60 left-32 text-3xl opacity-25 animate-pulse" style={{ animationDelay: '3s' }}>🌭</div>
            <div className="absolute top-40 left-1/3 text-3xl opacity-30 animate-bounce" style={{ animationDelay: '1.8s' }}>🍦</div>
            <div className="absolute bottom-20 right-1/4 text-4xl opacity-25 animate-pulse" style={{ animationDelay: '2.2s' }}>🥤</div>
            <div className="absolute top-1/2 right-5 text-3xl opacity-30 animate-bounce" style={{ animationDelay: '0.8s' }}>🍩</div>

            <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}></div>
          </div>

          {/* Login Card */}
          <div className="relative max-w-lg z-10 w-full mx-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-200 border-opacity-40 p-8 transform transition-all duration-300 hover:shadow-3xl">

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">QuickBite</h1>
                <p className="text-gray-600 text-sm mb-2">Welcome back to QuickBite</p>
                <p className="text-orange-600 text-xs font-medium">
                  🚀 30 min delivery • 🍕 Fresh & Hot • 📱 Easy ordering
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl backdrop-blur-sm border bg-red-100 bg-opacity-80 border-red-300 text-red-700 text-sm font-medium transition-all duration-300">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                  </div>
                </div>
              )}



              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Field */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative w-full">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
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
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </span>
                </button>
              </form>

              {/* Google Sign In Button */}
              {GOOGLE_CLIENT_ID && (
                <div className="mt-6">
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign in with</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                    />
                  </div>
                </div>
              )}

              {/* Sample Login for Recruiters */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Sample Login for Recruiters
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sampleAccounts.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleSampleLogin(account)}
                      className={`flex items-center p-3 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${account.color}`}
                    >
                      <span className="text-xl mr-2">{account.icon}</span>
                      <div className="text-left">
                        <div className="text-xs font-bold">{account.label}</div>
                        <div className="text-[10px] opacity-80 truncate w-24">Click to fill</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center flex flex-col gap-2">
                <div>
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setCurrentPage('register')}
                    className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                  >
                    ← Back to Home
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </>
  );
};

export default Login;