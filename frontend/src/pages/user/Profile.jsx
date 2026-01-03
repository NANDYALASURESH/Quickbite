import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, User, Phone, Mail, Save, Navigation, AlertCircle, CheckCircle } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
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
    );
};

export default UserProfile;
