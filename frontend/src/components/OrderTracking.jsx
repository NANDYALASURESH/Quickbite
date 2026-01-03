import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { MapPin, Truck, CheckCircle, Clock } from 'lucide-react';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const StatusStep = ({ icon, label, active, completed }) => (
  <div className="flex flex-col items-center">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
      completed ? 'bg-green-500 text-white' :
      active ? 'bg-orange-500 text-white' :
      'bg-gray-200 text-gray-400'
    }`}>
      {icon}
    </div>
    <p className={`text-xs mt-2 font-medium ${
      active || completed ? 'text-gray-800' : 'text-gray-400'
    }`}>
      {label}
    </p>
  </div>
);

const OrderTracking = ({ orderId, order }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = API_URL.replace('/api', '');
    
    const newSocket = io(socketUrl, {
      transports: ['websocket']
    });

    setSocket(newSocket);
    newSocket.emit('join-order', orderId);

    newSocket.on('location-updated', (data) => {
      setDeliveryLocation(data.location);
      calculateETA(data.location);
    });

    newSocket.on('order-status-updated', (data) => {
      if (data.status === 'delivered') {
        alert('Your order has been delivered! 🎉');
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  const calculateETA = (currentLocation) => {
    if (!order?.deliveryAddress) return;
    
    // If deliveryLocation coordinates exist
    const destLat = order.deliveryLocation?.coordinates?.[1] || 0;
    const destLon = order.deliveryLocation?.coordinates?.[0] || 0;
    
    if (!destLat || !destLon) return;
    
    const distance = getDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destLat,
      destLon
    );
    
    const avgSpeed = 30; // km/h
    const etaMinutes = Math.round((distance / avgSpeed) * 60);
    setEta(etaMinutes);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (!order) return <div className="p-4">Loading...</div>;

  // Get restaurant location (coordinates are [longitude, latitude])
  const restaurantLocation = order.restaurant?.location?.coordinates || [77.5946, 12.9716]; // Default to Bangalore
  const deliveryAddress = order.deliveryLocation?.coordinates || restaurantLocation;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Track Your Order</h2>
        
        <div className="flex items-center justify-between mb-6">
          <StatusStep 
            icon={<CheckCircle size={24} />}
            label="Placed"
            active={true}
            completed={true}
          />
          <div className="flex-1 h-1 bg-gray-300 mx-2">
            <div className={`h-full bg-orange-500 transition-all ${
              ['confirmed', 'preparing', 'out-for-delivery', 'delivered'].includes(order.status) ? 'w-full' : 'w-0'
            }`} />
          </div>
          <StatusStep 
            icon={<Clock size={24} />}
            label="Preparing"
            active={order.status === 'preparing'}
            completed={['out-for-delivery', 'delivered'].includes(order.status)}
          />
          <div className="flex-1 h-1 bg-gray-300 mx-2">
            <div className={`h-full bg-orange-500 transition-all ${
              ['out-for-delivery', 'delivered'].includes(order.status) ? 'w-full' : 'w-0'
            }`} />
          </div>
          <StatusStep 
            icon={<Truck size={24} />}
            label="On the Way"
            active={order.status === 'out-for-delivery'}
            completed={order.status === 'delivered'}
          />
          <div className="flex-1 h-1 bg-gray-300 mx-2">
            <div className={`h-full bg-orange-500 transition-all ${
              order.status === 'delivered' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <StatusStep 
            icon={<CheckCircle size={24} />}
            label="Delivered"
            active={order.status === 'delivered'}
            completed={order.status === 'delivered'}
          />
        </div>

        {eta && order.status === 'out-for-delivery' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="text-orange-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Estimated Arrival</p>
                <p className="text-xl font-bold text-orange-600">{eta} minutes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {order.status === 'out-for-delivery' && deliveryLocation && (
        <div className="rounded-lg overflow-hidden border-2 border-gray-200 mb-6" style={{ height: '400px' }}>
          <MapContainer 
            center={[deliveryLocation.latitude, deliveryLocation.longitude]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {/* Restaurant Marker */}
            <Marker position={[restaurantLocation[1], restaurantLocation[0]]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">{order.restaurant?.name || 'Restaurant'}</p>
                  <p className="text-sm text-gray-600">Restaurant</p>
                </div>
              </Popup>
            </Marker>

            {/* Delivery Person Marker */}
            <Marker position={[deliveryLocation.latitude, deliveryLocation.longitude]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">Delivery Person</p>
                  <p className="text-sm text-gray-600">On the way</p>
                </div>
              </Popup>
            </Marker>

            {/* Delivery Address Marker */}
            <Marker position={[deliveryAddress[1], deliveryAddress[0]]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">Your Location</p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress?.street}</p>
                </div>
              </Popup>
            </Marker>

            {/* Route Line */}
            <Polyline 
              positions={[
                [deliveryLocation.latitude, deliveryLocation.longitude],
                [deliveryAddress[1], deliveryAddress[0]]
              ]}
              color="orange"
              weight={3}
            />
          </MapContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Restaurant</h3>
          <p className="text-gray-700">{order.restaurant?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600">{order.restaurant?.phone || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Delivery Address</h3>
          <p className="text-gray-700">{order.deliveryAddress?.street}</p>
          <p className="text-sm text-gray-600">{order.deliveryAddress?.city}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
