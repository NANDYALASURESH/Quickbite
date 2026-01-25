import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const OwnerDashboard = () => {
  const { token, API_URL } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateRestaurant, setShowCreateRestaurant] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: [],
    latitude: '',
    longitude: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    phone: '',
    email: '',
    taxPercent: 5,
    deliverySettings: {
      isDeliveryAvailable: true,
      deliveryRadius: 5,
      minimumOrderAmount: 0,
      deliveryFee: 0,
      estimatedDeliveryTime: 30
    }
  });


  const cuisineOptions = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American', 'Continental', 'Fast Food', 'Desserts', 'Beverages'];

  useEffect(() => {
    fetchDashboard();
    fetchRestaurant();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/owner/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`${API_URL}/owner/restaurants/my-restaurant`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRestaurant(data.restaurant);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/owner/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setRestaurant(data.restaurant);
        setShowCreateRestaurant(false);
        alert('Restaurant created successfully!');
        fetchDashboard();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to create restaurant');
    }
  };

  const toggleCuisine = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  if (loading) return <Loader />;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Store className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Restaurant Found</h2>
            <p className="text-gray-600 mb-6">Create your restaurant to start managing your business</p>
            <button
              onClick={() => setShowCreateRestaurant(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Create Restaurant
            </button>
          </div>

          <Modal
            isOpen={showCreateRestaurant}
            onClose={() => setShowCreateRestaurant(false)}
            title="Create Restaurant"
            size="max-w-4xl"
          >
            <form onSubmit={handleCreateRestaurant} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Types *</label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map(cuisine => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${formData.cuisine.includes(cuisine)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Latitude (e.g. 16.9440)"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Longitude (e.g. 82.2529)"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>


              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="ZIP Code"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Tax Percent (%)"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Minimum Order Amount (₹)"
                    value={formData.deliverySettings.minimumOrderAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: { ...formData.deliverySettings, minimumOrderAmount: parseFloat(e.target.value) }
                    })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Delivery Fee (₹)"
                    value={formData.deliverySettings.deliveryFee}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: { ...formData.deliverySettings, deliveryFee: parseFloat(e.target.value) }
                    })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Est. Delivery Time (min)"
                    value={formData.deliverySettings.estimatedDeliveryTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: { ...formData.deliverySettings, estimatedDeliveryTime: parseInt(e.target.value) }
                    })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Delivery Radius (km)"
                    value={formData.deliverySettings.deliveryRadius}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: { ...formData.deliverySettings, deliveryRadius: parseFloat(e.target.value) }
                    })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
              >
                Create Restaurant
              </button>
            </form>
          </Modal>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

        {/* Stats Grid */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboard.orders.total}</p>
                </div>
                <Package className="text-blue-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboard.orders.today}</p>
                </div>
                <Clock className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboard.orders.pending}</p>
                </div>
                <AlertCircle className="text-yellow-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">₹{dashboard.revenue.total.toFixed(2)}</p>
                </div>
                <DollarSign className="text-orange-500" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {restaurant.email}</p>
                <p><strong>Phone:</strong> {restaurant.phone}</p>
                <p><strong>Address:</strong> {restaurant.address.street}, {restaurant.address.city}</p>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-bold text-gray-800">{restaurant.rating.average || 'New'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-bold text-gray-800">{restaurant.rating.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {restaurant.isActive ? 'Open' : 'Closed'}
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_URL}/owner/restaurants/toggle-status`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          const data = await response.json();
                          if (data.success) {
                            setRestaurant({ ...restaurant, isActive: data.isActive });
                          } else {
                            alert(data.message);
                          }
                        } catch (error) {
                          alert('Failed to toggle restaurant status');
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${restaurant.isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      {restaurant.isActive ? 'Close Restaurant' : 'Open Restaurant'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;