import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

const DeliveryProfile = () => {
    const { token, user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [deliveryData, setDeliveryData] = useState({
        vehicleType: 'bike',
        vehicleNumber: '',
        drivingLicense: ''
    });

    useEffect(() => {
        checkRegistration();
    }, []);

    const checkRegistration = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/active-order`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            // If we get a successful response, delivery person is registered
            if (response.ok) {
                setIsRegistered(true);
            }
        } catch (error) {
            console.error('Check registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/delivery/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(deliveryData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Successfully registered as delivery person!');
                setIsRegistered(true);
                setTimeout(() => {
                    window.location.reload(); // Refresh to show dashboard
                }, 1500);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Failed to register. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (isRegistered) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Registered!</h2>
                    <p className="text-gray-600 mb-6">
                        You are already registered as a delivery person. Access your dashboard from the home page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Truck className="text-blue-500" size={64} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Become a Delivery Partner</h1>
                    <p className="text-gray-600">Complete your delivery profile to start earning</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Type *
                        </label>
                        <select
                            required
                            value={deliveryData.vehicleType}
                            onChange={(e) => setDeliveryData({ ...deliveryData, vehicleType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        >
                            <option value="bike">Bike</option>
                            <option value="scooter">Scooter</option>
                            <option value="bicycle">Bicycle</option>
                            <option value="car">Car</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Number *
                        </label>
                        <input
                            type="text"
                            required
                            value={deliveryData.vehicleNumber}
                            onChange={(e) => setDeliveryData({ ...deliveryData, vehicleNumber: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="DL01AB1234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Driving License Number *
                        </label>
                        <input
                            type="text"
                            required
                            value={deliveryData.drivingLicense}
                            onChange={(e) => setDeliveryData({ ...deliveryData, drivingLicense: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="DL-1234567890"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Benefits:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>✓ Flexible working hours</li>
                            <li>✓ Earn up to 70% of delivery fees</li>
                            <li>✓ Real-time order tracking</li>
                            <li>✓ Weekly payouts</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>By registering, you agree to our delivery partner terms and conditions.</p>
                </div>
            </div>
        </div>
    );
};

export default DeliveryProfile;
