import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ChefHat, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; // Add this to your .env file

const Login = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
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
          credential: credentialResponse.credential,
          role: 'user' // Default role for Google sign-in
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Trigger auth context update
        window.location.reload();
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
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
                    width="100%"
                  />
                </div>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center flex flex-col gap-2">
              <div>
                <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-300 no-underline">
                  Forgot your password?
                </a>
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
  );
};

export default Login;