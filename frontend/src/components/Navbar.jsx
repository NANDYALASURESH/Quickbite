import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import {
  ChefHat, LogOut, Menu as MenuIcon, X, ShoppingCart,
  Package, Store, Users, User, Bell, Search, Moon, Sun
} from 'lucide-react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getNavItems = () => {
    if (user.role === 'user') {
      return [
        { id: 'home', label: 'Home', icon: ChefHat },
        { id: 'restaurants', label: 'Restaurants', icon: Store },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartItems.length },
        { id: 'orders', label: 'Orders', icon: Package },
      ];
    } else if (user.role === 'owner') {
      return [
        { id: 'home', label: 'Dashboard', icon: ChefHat },
        { id: 'menu', label: 'Menu', icon: Store },
        { id: 'orders', label: 'Orders', icon: Package },
      ];
    } else if (user.role === 'admin') {
      return [
        { id: 'home', label: 'Dashboard', icon: ChefHat },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'restaurants', label: 'Restaurants', icon: Store }
      ];
    } else if (user.role === 'delivery') {
      return [
        { id: 'home', label: 'Dashboard', icon: ChefHat },
        { id: 'orders', label: 'Orders', icon: Package },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">

          {/* Logo */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <ChefHat className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                QuickBite
              </span>
              <p className="hidden sm:block text-xs text-gray-500 -mt-1">Fast & Fresh Delivery</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>

                  {/* Badge */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-orange-50 rounded-xl transition-all group"
              >
                {/* Avatar */}
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 shadow-md group-hover:shadow-lg transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all">
                    {getUserInitials()}
                  </div>
                )}

                {/* User Info */}
                <div className="text-left hidden xl:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                  <p className="text-xs text-orange-600 font-medium capitalize">{user.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-white/80 capitalize">{user.role} Account</p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setCurrentPage('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all text-left"
                    >
                      <User size={18} />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentPage('orders');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all text-left"
                    >
                      <Package size={18} />
                      <span className="text-sm font-medium">My Orders</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all text-left font-medium"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-2">

            {/* User Info - Mobile */}
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mb-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getUserInitials()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-white/80 capitalize">{user.role} Account</p>
              </div>
            </div>

            {/* Nav Items - Mobile */}
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative ${isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>

                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Profile - Mobile */}
            <button
              onClick={() => {
                setCurrentPage('profile');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </button>

            {/* Logout - Mobile */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-lg"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;