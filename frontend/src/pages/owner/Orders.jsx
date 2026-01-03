import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Truck, User } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const OwnerOrders = () => {
  const { token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Delivery Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const url = filterStatus
        ? `${API_URL}/owner/orders?status=${filterStatus}`
        : `${API_URL}/owner/orders`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const response = await fetch(`${API_URL}/owner/available-delivery-persons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDeliveryPersons(data.deliveryPersons);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/owner/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
        alert('Order status updated');
      }
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleAssignClick = (order) => {
    setSelectedOrder(order);
    fetchDeliveryPersons(); // Refresh list when opening modal
    setShowAssignModal(true);
  };

  const assignDeliveryPerson = async (deliveryPersonId) => {
    if (!selectedOrder) return;

    setLoadingDelivery(true);
    try {
      const response = await fetch(`${API_URL}/owner/orders/${selectedOrder._id}/assign-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryPersonId })
      });

      const data = await response.json();

      if (data.success) {
        alert('Delivery person assigned successfully!');
        setShowAssignModal(false);
        fetchOrders(); // Refresh orders to show updated status
        fetchDeliveryPersons(); // Refresh delivery persons (list might change)
      } else {
        alert(data.message || 'Failed to assign delivery person');
      }
    } catch (error) {
      console.error('Assign error:', error);
      alert('Failed to assign delivery person');
    } finally {
      setLoadingDelivery(false);
    }
  };

  const statuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders Management</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg font-medium transition ${!filterStatus ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            All
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filterStatus === status ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Customer: {order.user.name} ({order.user.phone})
                    </p>
                    {/* Show assigned delivery person if any */}
                    {order.deliveryPerson && (
                      <p className="text-blue-600 text-sm font-medium mt-1 flex items-center">
                        <Truck size={14} className="mr-1" />
                        Delivery: Assigned
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                    <p className="text-2xl font-bold text-orange-500 mt-2">
                      ₹{order.pricing.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-b border-gray-200 py-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mb-4 text-sm text-gray-600">
                  <strong>Delivery:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </div>

                {/* Actions */}
                {!['delivered', 'cancelled'].includes(order.status) && (
                  <div className="flex flex-wrap gap-2">
                    {/* Assign Delivery Button - Show for appropriate statuses if not already delivered/cancelled */}
                    {!order.deliveryPerson && ['confirmed', 'preparing'].includes(order.status) && (
                      <button
                        onClick={() => handleAssignClick(order)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center"
                      >
                        <Truck size={16} className="mr-2" />
                        Assign Delivery
                      </button>
                    )}

                    {statuses.filter(s => s !== order.status && !['delivered', 'cancelled'].includes(s)).map(status => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order._id, status)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm capitalize"
                      >
                        Mark as {status.replace('-', ' ')}
                      </button>
                    ))}

                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      Mark Delivered
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this order?')) {
                          updateOrderStatus(order._id, 'cancelled');
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Assignment Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Delivery Person"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a delivery person for Order #{selectedOrder?._id.slice(-8).toUpperCase()}
            </p>

            {loadingDelivery ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Processing...</p>
              </div>
            ) : deliveryPersons.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Truck className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No delivery persons available online.</p>
                <p className="text-sm text-gray-500">Wait for someone to go online.</p>
                <button
                  onClick={fetchDeliveryPersons}
                  className="mt-4 text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Refresh List
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {deliveryPersons.map(person => (
                  <div
                    key={person._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition"
                    onClick={() => assignDeliveryPerson(person._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{person.user.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{person.vehicleType} • {person.user.phone}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OwnerOrders;