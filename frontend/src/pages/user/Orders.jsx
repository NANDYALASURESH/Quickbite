import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Star, MapPin } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import OrderTracking from '../../components/OrderTracking';

const UserOrders = () => {
  const { token, API_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [rating, setRating] = useState({ food: 5, delivery: 5, review: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/user/orders`, {
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`${API_URL}/user/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
        alert('Order cancelled successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to cancel order');
    }
  };

  const handleSubmitRating = async () => {
    try {
      const response = await fetch(`${API_URL}/user/orders/${selectedOrder._id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rating)
      });
      const data = await response.json();
      if (data.success) {
        setShowRating(false);
        fetchOrders();
        alert('Thank you for your rating!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to submit rating');
    }
  };

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

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircle size={20} />;
    if (status === 'cancelled') return <XCircle size={20} />;
    return <Clock size={20} />;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600">Start ordering from your favorite restaurants!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {order.restaurant.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end space-y-2">
                      <span className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </span>
                      <p className="text-2xl font-bold text-orange-500">
                        ₹{order.pricing.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-b border-gray-200 py-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">{item.quantity}x</span>
                            <span className="text-gray-800">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>Delivery Address</span>
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      View Details
                    </button>

                    {['pending', 'confirmed', 'preparing', 'out-for-delivery'].includes(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowTracking(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Track Order
                      </button>
                    )}

                    {['pending', 'confirmed'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'delivered' && !order.rating?.overall && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowRating(true);
                        }}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center space-x-2"
                      >
                        <Star size={16} />
                        <span>Rate Order</span>
                      </button>
                    )}

                    {order.rating?.overall && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                        <Star size={16} className="fill-current" />
                        <span className="font-medium">Rated: {order.rating.overall}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      <Modal
        isOpen={showTracking}
        onClose={() => {
          setShowTracking(false);
          setSelectedOrder(null);
        }}
        title="Track Your Order"
        size="max-w-5xl"
      >
        {selectedOrder && (
          <OrderTracking orderId={selectedOrder._id} order={selectedOrder} />
        )}
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={selectedOrder && !showRating && !showTracking}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Restaurant</h3>
              <p className="text-gray-800 font-medium">{selectedOrder.restaurant.name}</p>
              <p className="text-gray-600 text-sm">{selectedOrder.restaurant.phone}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pricing Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrder.pricing.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{selectedOrder.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-orange-500">₹{selectedOrder.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delivery Information</h3>
              <p className="text-gray-600">
                {selectedOrder.deliveryAddress.street}<br />
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}<br />
                {selectedOrder.deliveryAddress.zipCode}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Contact:</strong> {selectedOrder.contactPhone}
              </p>
              <p className="text-gray-600">
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod.toUpperCase()}
              </p>
            </div>

            {selectedOrder.specialInstructions && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Special Instructions</h3>
                <p className="text-gray-600">{selectedOrder.specialInstructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRating}
        onClose={() => {
          setShowRating(false);
          setRating({ food: 5, delivery: 5, review: '' });
        }}
        title="Rate Your Order"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Quality (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating.food}
              onChange={(e) => setRating({ ...rating, food: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Service (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating.delivery}
              onChange={(e) => setRating({ ...rating, delivery: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={rating.review}
              onChange={(e) => setRating({ ...rating, review: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              placeholder="Share your experience..."
            />
          </div>

          <button
            onClick={handleSubmitRating}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Submit Rating
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserOrders;