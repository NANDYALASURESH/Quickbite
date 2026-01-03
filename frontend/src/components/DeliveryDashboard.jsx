import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, DollarSign, Package, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DeliveryDashboard = () => {
    const { token, user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [isOnline, setIsOnline] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(true);
    const [registrationData, setRegistrationData] = useState({
        vehicleType: 'bike',
        vehicleNumber: '',
        drivingLicense: ''
    });
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchActiveOrder();
            fetchEarnings();
            fetchStatus();

            const locationInterval = setInterval(() => {
                if (isOnline) updateLocation();
            }, 10000);

            return () => clearInterval(locationInterval);
        }
    }, [user, isOnline]);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setIsOnline(data.isOnline);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    const fetchActiveOrder = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/active-order`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 404) {
                setIsRegistered(false);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setActiveOrder(data.order);
            }
        } catch (error) {
            console.error('Error fetching active order:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEarnings = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 404) {
                setIsRegistered(false);
                setLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setEarnings(data.earnings);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setRegistering(true);

        try {
            const response = await fetch(`${API_URL}/delivery/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (data.success) {
                setIsRegistered(true);
                window.location.reload();
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Failed to register. Please try again.');
        } finally {
            setRegistering(false);
        }
    };

    const updateLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    await fetch(`${API_URL}/delivery/update-location`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    });
                } catch (error) {
                    console.error('Error updating location:', error);
                }
            });
        }
    };

    const toggleOnlineStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/toggle-availability`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setIsOnline(data.isOnline);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`${API_URL}/delivery/update-order-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status })
            });
            const data = await response.json();
            if (data.success) {
                fetchActiveOrder();
                fetchEarnings();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    // Show registration form if not registered
    if (!isRegistered) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <Truck className="mx-auto text-blue-500 mb-4" size={64} />
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600">Register your vehicle details to start delivering</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                            <select
                                required
                                value={registrationData.vehicleType}
                                onChange={(e) => setRegistrationData({ ...registrationData, vehicleType: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="bicycle">Bicycle</option>
                                <option value="car">Car</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
                            <input
                                type="text"
                                required
                                value={registrationData.vehicleNumber}
                                onChange={(e) => setRegistrationData({ ...registrationData, vehicleNumber: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="DL01AB1234"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number *</label>
                            <input
                                type="text"
                                required
                                value={registrationData.drivingLicense}
                                onChange={(e) => setRegistrationData({ ...registrationData, drivingLicense: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="DL-1234567890"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={registering}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {registering ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Delivery Dashboard</h1>
                            <p className="text-gray-600">Welcome, {user?.name}!</p>
                        </div>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`px-6 py-3 rounded-lg font-semibold transition ${isOnline
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                    <p className="mt-2 text-sm">
                        Status: <span className={`font-semibold ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </p>
                </div>

                {/* Earnings Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Today</p>
                                <p className="text-2xl font-bold text-gray-800">₹{earnings.today.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-green-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">This Week</p>
                                <p className="text-2xl font-bold text-gray-800">₹{earnings.week.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-blue-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">This Month</p>
                                <p className="text-2xl font-bold text-gray-800">₹{earnings.month.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-purple-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total</p>
                                <p className="text-2xl font-bold text-gray-800">₹{earnings.total.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-orange-500" size={32} />
                        </div>
                    </div>
                </div>

                {/* Active Order */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Delivery</h2>
                    {activeOrder ? (
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <Package className="text-blue-500 mt-1" size={24} />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">Order #{activeOrder._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-gray-600">Customer: {activeOrder.user?.name}</p>
                                    <p className="text-gray-600">Phone: {activeOrder.user?.phone}</p>
                                    <p className="text-gray-600 mt-2">
                                        <MapPin className="inline mr-1" size={16} />
                                        {activeOrder.deliveryAddress?.street}, {activeOrder.deliveryAddress?.city}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Status: {activeOrder.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {activeOrder.status === 'confirmed' && (
                                    <button
                                        onClick={() => updateOrderStatus(activeOrder._id, 'out-for-delivery')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Mark Picked Up
                                    </button>
                                )}
                                {activeOrder.status === 'out-for-delivery' && (
                                    <button
                                        onClick={() => updateOrderStatus(activeOrder._id, 'delivered')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Truck className="mx-auto text-gray-400 mb-4" size={64} />
                            <p className="text-gray-600">No Active Deliveries</p>
                            <p className="text-sm text-gray-500">Go online to receive orders</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
