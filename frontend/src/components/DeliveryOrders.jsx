import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, Clock, CheckCircle, DollarSign, Calendar, XCircle, Truck, Filter } from 'lucide-react';

const DeliveryOrders = () => {
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, delivered, cancelled

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/delivery/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'delivered') return order.status === 'delivered';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'out-for-delivery':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={16} />;
            case 'cancelled':
                return <XCircle size={16} />;
            case 'out-for-delivery':
                return <Truck size={16} />;
            default:
                return <Package size={16} />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDeliveryTime = (order) => {
        if (order.deliveryTracking?.pickedUpAt && order.deliveryTracking?.deliveredAt) {
            const pickupTime = new Date(order.deliveryTracking.pickedUpAt);
            const deliveryTime = new Date(order.deliveryTracking.deliveredAt);
            const diffMinutes = Math.round((deliveryTime - pickupTime) / 60000);
            return `${diffMinutes} min`;
        }
        return 'N/A';
    };

    const calculateEarnings = (order) => {
        // 70% of delivery fee goes to delivery person
        return (order.pricing?.deliveryFee * 0.7).toFixed(2);
    };

    const totalStats = {
        totalDeliveries: orders.filter(o => o.status === 'delivered').length,
        totalEarnings: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.pricing?.deliveryFee * 0.7), 0)
            .toFixed(2),
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Order History</h1>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Deliveries</p>
                                    <p className="text-2xl font-bold text-green-700">{totalStats.totalDeliveries}</p>
                                </div>
                                <CheckCircle className="text-green-500" size={32} />
                            </div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Total Earnings</p>
                                    <p className="text-2xl font-bold text-orange-700">₹{totalStats.totalEarnings}</p>
                                </div>
                                <DollarSign className="text-orange-500" size={32} />
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-700">{totalStats.cancelledOrders}</p>
                                </div>
                                <XCircle className="text-red-500" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center space-x-2">
                        <Filter size={20} className="text-gray-600" />
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({orders.length})
                            </button>
                            <button
                                onClick={() => setFilter('delivered')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'delivered'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Delivered ({orders.filter(o => o.status === 'delivered').length})
                            </button>
                            <button
                                onClick={() => setFilter('cancelled')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'cancelled'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cancelled ({orders.filter(o => o.status === 'cancelled').length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <Package className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
                            <p className="text-gray-600">
                                {filter === 'all'
                                    ? 'You haven\'t completed any deliveries yet.'
                                    : `No ${filter} orders found.`}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Package className="text-orange-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <Calendar size={14} className="mr-1" />
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="capitalize">{order.status.replace('-', ' ')}</span>
                                        </span>
                                        {order.status === 'delivered' && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                                +₹{calculateEarnings(order)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Customer Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-700 text-sm">Customer</h4>
                                        <p className="text-gray-800">{order.user?.name || 'N/A'}</p>
                                        <p className="text-gray-600 text-sm">{order.user?.phone || 'N/A'}</p>
                                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>
                                                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Restaurant Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-700 text-sm">Restaurant</h4>
                                        <p className="text-gray-800">{order.restaurant?.name || 'N/A'}</p>
                                        <p className="text-gray-600 text-sm">{order.restaurant?.phone || 'N/A'}</p>
                                        {order.status === 'delivered' && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Clock size={16} />
                                                <span>Delivery Time: {calculateDeliveryTime(order)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Order Items</h4>
                                    <div className="space-y-1">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {item.quantity}x {item.menuItem?.name || 'Item'}
                                                </span>
                                                <span className="text-gray-800 font-medium">₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>₹{order.pricing?.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrders;
