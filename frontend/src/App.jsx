import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserHome from './pages/user/Home';
import UserRestaurants from './pages/user/Restaurants';
import UserCart from './pages/user/Cart';
import UserOrders from './pages/user/Orders';
import UserProfile from './pages/user/Profile';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerMenu from './pages/owner/Menu';
import OwnerOrders from './pages/owner/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRestaurants from './pages/admin/Restaurants';
import DeliveryDashboard from './components/DeliveryDashboard';
import DeliveryOrders from './components/DeliveryOrders';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Main App Component
function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}

      <main>
        <Routes>
          {/* Public Routes */}
          {!user ? (
            <>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {/* Role-Based Routes */}
              {user.role === 'user' && (
                <>
                  <Route path="/" element={<UserHome />} />
                  <Route path="/restaurants" element={<UserRestaurants />} />
                  <Route path="/cart" element={<UserCart />} />
                  <Route path="/orders" element={<UserOrders />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {user.role === 'owner' && (
                <>
                  <Route path="/" element={<OwnerDashboard />} />
                  <Route path="/menu" element={<OwnerMenu />} />
                  <Route path="/orders" element={<OwnerOrders />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/restaurants" element={<AdminRestaurants />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {user.role === 'delivery' && (
                <>
                  <Route path="/" element={<DeliveryDashboard />} />
                  <Route path="/orders" element={<DeliveryOrders />} />
                  <Route path="/profile" element={<UserProfile />} />
                </>
              )}

              {/* Redirect any other logged in route to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;




