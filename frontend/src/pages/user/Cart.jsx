import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, Store, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';

const UserCart = ({ setCurrentPage }) => {
  const { token, API_URL, user } = useAuth();
  const { cartItems, restaurant, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      landmark: ''
    },
    paymentMethod: 'cash',
    specialInstructions: '',
    contactPhone: user.phone || ''
  });

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.address) {
            setOrderData(prev => ({
              ...prev,
              deliveryAddress: {
                ...prev.deliveryAddress,
                street: data.address.road || data.address.suburb || '',
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                zipCode: data.address.postcode || ''
              }
            }));
          }
        } catch (error) {
          setError('Failed to get address from location');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setError('Unable to retrieve your location');
        setGettingLocation(false);
      }
    );
  };

  const handleCheckout = async () => {
    setError('');

    if (!orderData.contactPhone) {
      setError('Please provide a contact phone number');
      return;
    }

    if (!orderData.deliveryAddress.street || !orderData.deliveryAddress.city) {
      setError('Please provide complete delivery address');
      return;
    }

    const subtotal = getTotal();
    if (restaurant && subtotal < restaurant.deliverySettings.minimumOrderAmount) {
      setError(`Minimum order amount is ₹${restaurant.deliverySettings.minimumOrderAmount}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          items: cartItems.map(item => ({
            menuItemId: item._id,
            quantity: item.quantity
          })),
          ...orderData
        })
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        alert('Order placed successfully!');
        setCurrentPage('orders');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items from restaurants to get started</p>
          <button
            onClick={() => setCurrentPage('restaurants')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = restaurant?.deliverySettings.deliveryFee || 0;
  const tax = (subtotal * (restaurant?.taxPercent || 5)) / 100;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center space-x-4">
                  <Store className="text-orange-500" size={32} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
                    <p className="text-gray-600 text-sm">{restaurant.address.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            {cartItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <p className="text-xl font-bold text-orange-500">₹{item.finalPrice}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      <Trash2 size={20} />
                    </button>

                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-800">
                      ₹{(item.finalPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({restaurant?.taxPercent || 5}%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
                <span>Total</span>
                <span className="text-orange-500">₹{total.toFixed(2)}</span>
              </div>

              {restaurant && subtotal < restaurant.deliverySettings.minimumOrderAmount && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Minimum order: ₹{restaurant.deliverySettings.minimumOrderAmount}
                    <br />
                    Add ₹{(restaurant.deliverySettings.minimumOrderAmount - subtotal).toFixed(2)} more
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowCheckout(true)}
                disabled={restaurant && subtotal < restaurant.deliverySettings.minimumOrderAmount}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="Checkout"
        size="max-w-3xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Delivery Address</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                <span>{gettingLocation ? 'Getting...' : 'Use Location'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Street Address"
                value={orderData.deliveryAddress.street}
                onChange={(e) => setOrderData({
                  ...orderData,
                  deliveryAddress: { ...orderData.deliveryAddress, street: e.target.value }
                })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="City"
                value={orderData.deliveryAddress.city}
                onChange={(e) => setOrderData({
                  ...orderData,
                  deliveryAddress: { ...orderData.deliveryAddress, city: e.target.value }
                })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="State"
                value={orderData.deliveryAddress.state}
                onChange={(e) => setOrderData({
                  ...orderData,
                  deliveryAddress: { ...orderData.deliveryAddress, state: e.target.value }
                })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={orderData.deliveryAddress.zipCode}
                onChange={(e) => setOrderData({
                  ...orderData,
                  deliveryAddress: { ...orderData.deliveryAddress, zipCode: e.target.value }
                })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={orderData.deliveryAddress.landmark}
                onChange={(e) => setOrderData({
                  ...orderData,
                  deliveryAddress: { ...orderData.deliveryAddress, landmark: e.target.value }
                })}
                className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
            <input
              type="tel"
              placeholder="Phone Number"
              value={orderData.contactPhone}
              onChange={(e) => setOrderData({ ...orderData, contactPhone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['cash', 'card', 'upi', 'wallet'].map(method => (
                <button
                  key={method}
                  onClick={() => setOrderData({ ...orderData, paymentMethod: method })}
                  className={`px-4 py-3 rounded-lg font-medium transition ${orderData.paymentMethod === method
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Special Instructions</h3>
            <textarea
              placeholder="Any special instructions for delivery?"
              value={orderData.specialInstructions}
              onChange={(e) => setOrderData({ ...orderData, specialInstructions: e.target.value })}
              rows="3"
              maxLength="200"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Place Order (₹${total.toFixed(2)})`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserCart;