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
// import DeliveryProfile from './components/DeliveryProfile'; // Not used in original file
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent({ currentPage, setCurrentPage }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}

      <main>
        {!user ? (
          currentPage === 'register' ? (
            <Register setCurrentPage={setCurrentPage} />
          ) : currentPage === 'login' ? (
            <Login setCurrentPage={setCurrentPage} />
          ) : (
            <Welcome setCurrentPage={setCurrentPage} />
          )
        ) : user.role === 'user' ? (
          <>
            {currentPage === 'home' && <UserHome setCurrentPage={setCurrentPage} />}
            {currentPage === 'restaurants' && <UserRestaurants setCurrentPage={setCurrentPage} />}
            {currentPage === 'cart' && <UserCart setCurrentPage={setCurrentPage} />}
            {currentPage === 'orders' && <UserOrders />}
            {currentPage === 'profile' && <UserProfile />}
          </>
        ) : user.role === 'owner' ? (
          <>
            {currentPage === 'home' && <OwnerDashboard />}
            {currentPage === 'menu' && <OwnerMenu />}
            {currentPage === 'orders' && <OwnerOrders />}
            {currentPage === 'profile' && <UserProfile />}
          </>
        ) : user.role === 'admin' ? (
          <>
            {currentPage === 'home' && <AdminDashboard />}
            {currentPage === 'users' && <AdminUsers />}
            {currentPage === 'restaurants' && <AdminRestaurants />}
            {currentPage === 'profile' && <UserProfile />}
          </>
        ) : user.role === 'delivery' ? (
          <>
            {currentPage === 'home' && <DeliveryDashboard />}
            {currentPage === 'orders' && <DeliveryOrders />}
            {currentPage === 'profile' && <UserProfile />}
          </>
        ) : null}
      </main>
    </div>
  );
}

export default App;




