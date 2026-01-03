import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Store, Package, DollarSign, TrendingUp } from 'lucide-react';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const { token, API_URL } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!dashboard) return <div>Error loading dashboard</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{dashboard.overview.totalUsers}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Restaurants</p>
                <p className="text-3xl font-bold text-gray-800">{dashboard.overview.totalRestaurants}</p>
              </div>
              <Store className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{dashboard.overview.totalOrders}</p>
              </div>
              <Package className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">₹{dashboard.overview.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Users Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold text-green-600">{dashboard.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive Users</span>
                <span className="font-bold text-red-600">{dashboard.users.inactive}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers</span>
                    <span className="font-bold">{dashboard.users.byRole.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owners</span>
                    <span className="font-bold">{dashboard.users.byRole.owners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admins</span>
                    <span className="font-bold">{dashboard.users.byRole.admins}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurants Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Restaurants Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600">{dashboard.restaurants.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive</span>
                <span className="font-bold text-red-600">{dashboard.restaurants.inactive}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Orders Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{dashboard.orders.total}</p>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{dashboard.orders.today}</p>
              <p className="text-gray-600 text-sm">Today's Orders</p>
            </div>
            {dashboard.orders.byStatus.map(status => (
              <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">{status.count}</p>
                <p className="text-gray-600 text-sm capitalize">{status._id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Restaurants</h2>
          <div className="space-y-4">
            {dashboard.topRestaurants.map((rest, index) => (
              <div key={rest._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{rest.name}</h3>
                    <p className="text-sm text-gray-600">{rest.orderCount} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-500">₹{rest.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;