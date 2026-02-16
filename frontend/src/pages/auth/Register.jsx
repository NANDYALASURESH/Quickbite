import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, AlertCircle, Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import OTPVerification from '../../components/OTPVerification';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Register = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Very Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Weak', color: 'bg-orange-500' },
      { strength: 3, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 4, label: 'Good', color: 'bg-blue-500' },
      { strength: 5, label: 'Strong', color: 'bg-green-500' }
    ];

    return levels[strength];
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address
        })
      });

      const data = await response.json();

      if (data.success && data.requiresVerification) {
        // Show OTP verification modal
        setRegisteredEmail(formData.email);
        setShowOTPVerification(true);
        setError('');
      } else if (!data.success) {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          role: formData.role // Use selected role
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.message || 'Google registration failed');
      }
    } catch (err) {
      console.error('Google registration error:', err);
      setError('Failed to register with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google registration failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-200 via-red-200 to-red-300 py-8">

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

        {/* Register Card */}
        <div className="relative max-w-2xl z-10 w-full mx-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-200 border-opacity-40 p-6 md:p-8 transform transition-all duration-300 hover:shadow-3xl">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Join QuickBite</h1>
              <p className="text-gray-600 text-sm">Create your account and start ordering</p>
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

            {/* Google Sign In Button */}
            {GOOGLE_CLIENT_ID && (
              <div className="mb-6">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Register as</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'user' })}
                    className={`py-2 md:py-3 px-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 border ${formData.role === 'user'
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-base md:text-lg mb-1">👤</span>
                      <span>Customer</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'owner' })}
                    className={`py-2 md:py-3 px-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 border ${formData.role === 'owner'
                      ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                      : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-base md:text-lg mb-1">🍽️</span>
                      <span>Owner</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'delivery' })}
                    className={`py-2 md:py-3 px-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 border ${formData.role === 'delivery'
                      ? 'bg-green-500 text-white border-green-500 shadow-md'
                      : 'bg-white bg-opacity-60 text-gray-700 border-gray-300 hover:bg-opacity-80'
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-base md:text-lg mb-1">🚴</span>
                      <span>Delivery</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-300 z-20"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Address (Optional)</h3>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="w-full pl-10 pr-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                    className="w-full px-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    className="w-full px-3 py-3 bg-white bg-opacity-50 border border-gray-300 border-opacity-50 rounded-xl text-gray-800 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:bg-opacity-80 placeholder-gray-500 col-span-2 md:col-span-1"
                    placeholder="ZIP Code"
                  />
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300 bg-transparent border-none cursor-pointer"
                >
                  Login here
                </button>
              </p>
              <p className="text-sm text-gray-600 mt-2">
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

        {/* OTP Verification Modal */}
        {showOTPVerification && (
          <OTPVerification
            email={registeredEmail}
            onSuccess={() => {
              setShowOTPVerification(false);
              setCurrentPage('login');
            }}
            onClose={() => setShowOTPVerification(false)}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
