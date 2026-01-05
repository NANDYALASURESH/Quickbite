import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, User, Phone, Mail, Save, Navigation, AlertCircle, CheckCircle, Link2, Unlink, Lock, Shield } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const UserProfile = () => {
    const { token, user, API_URL } = useAuth();

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            zipCode: user?.address?.zipCode || ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || ''
                }
            });
        }
    }, [user]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        setMessage({ type: '', text: '' });

        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            setGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Use reverse geocoding API (you can use Google Maps, OpenStreetMap, etc.)
                    // For now, we'll just set coordinates and let user fill details
                    const { latitude, longitude } = position.coords;

                    // Using OpenStreetMap Nominatim for reverse geocoding (free)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data.address) {
                        setProfileData(prev => ({
                            ...prev,
                            address: {
                                street: data.address.road || data.address.suburb || '',
                                city: data.address.city || data.address.town || data.address.village || '',
                                state: data.address.state || '',
                                zipCode: data.address.postcode || ''
                            }
                        }));
                        setMessage({ type: 'success', text: 'Location detected! Please verify the address.' });
                    }
                } catch (error) {
                    setMessage({ type: 'error', text: 'Failed to get address from location' });
                } finally {
                    setGettingLocation(false);
                }
            },
            (error) => {
                setMessage({ type: 'error', text: 'Unable to retrieve your location. Please enter manually.' });
                setGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Optionally reload user data
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkGoogle = async (credentialResponse) => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const response = await fetch(`${API_URL}/auth/link-google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Google account linked successfully!' });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to link Google account' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to link Google account. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkGoogle = async () => {
        if (!confirm('Are you sure you want to unlink your Google account? You will need a password to login.')) {
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const response = await fetch(`${API_URL}/auth/unlink-google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Google account unlinked successfully!' });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to unlink Google account' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to unlink Google account. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const response = await fetch(`${API_URL}/auth/add-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Password added successfully!' });
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordForm(false);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to add password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add password. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return names[0][0];
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                        <div className="flex items-center space-x-6">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-orange-200">
                                    {getUserInitials()}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                <p className="text-gray-600">{user?.email}</p>
                                {user?.emailVerified && (
                                    <div className="flex items-center space-x-1 mt-2">
                                        <Shield className="text-green-500" size={16} />
                                        <span className="text-sm text-green-600 font-medium">Email Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                        <p className="text-gray-600 mb-6">Update your personal information and delivery address</p>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <User className="mr-2" size={20} />
                                    Personal Information
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <MapPin className="mr-2" size={20} />
                                        Delivery Address
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                    >
                                        <Navigation size={16} />
                                        <span>{gettingLocation ? 'Getting Location...' : 'Use Current Location'}</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            value={profileData.address.street}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                address: { ...profileData.address, street: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="123 Main Street, Apartment 4B"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={profileData.address.city}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    address: { ...profileData.address, city: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="Bangalore"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                            <input
                                                type="text"
                                                value={profileData.address.state}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    address: { ...profileData.address, state: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="Karnataka"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                value={profileData.address.zipCode}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    address: { ...profileData.address, zipCode: e.target.value }
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                placeholder="560001"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={20} />
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>

                        {/* Account Linking Section */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <Lock className="mr-2" size={20} />
                                Account Security
                            </h2>

                            <div className="space-y-4">
                                {/* Google Account Status */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Google Account</p>
                                                <p className="text-sm text-gray-600">
                                                    {user?.hasGoogleLinked ? 'Linked' : 'Not linked'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            {user?.hasGoogleLinked ? (
                                                <button
                                                    onClick={handleUnlinkGoogle}
                                                    disabled={loading}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                                >
                                                    <Unlink size={16} />
                                                    <span>Unlink</span>
                                                </button>
                                            ) : (
                                                <GoogleLogin
                                                    onSuccess={handleLinkGoogle}
                                                    onError={() => setMessage({ type: 'error', text: 'Failed to link Google account' })}
                                                    text="continue_with"
                                                    shape="rectangular"
                                                    size="medium"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Add Password for Google-only accounts */}
                                {user?.hasGoogleLinked && !showPasswordForm && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-blue-800">Password Authentication</p>
                                                <p className="text-sm text-blue-600">Add a password to enable email/password login</p>
                                            </div>
                                            <button
                                                onClick={() => setShowPasswordForm(true)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                            >
                                                Add Password
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Password Form */}
                                {showPasswordForm && (
                                    <form onSubmit={handleAddPassword} className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                                        <h3 className="font-semibold text-blue-800">Add Password</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                            >
                                                {loading ? 'Adding...' : 'Add Password'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setNewPassword('');
                                                    setConfirmPassword('');
                                                }}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Click "Use Current Location" to automatically detect your address</li>
                            <li>• Make sure to verify the auto-detected address before saving</li>
                            <li>• Your delivery address will be used for all future orders</li>
                            <li>• You can update your address anytime from this page</li>
                        </ul>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default UserProfile;
