import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ChefHat, LogOut, Menu as MenuIcon, X, ShoppingCart, Package, Store, Users, User } from 'lucide-react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getNavItems = () => {
    if (user.role === 'user') {
      return [
        { id: 'home', label: 'Home', icon: ChefHat },
        { id: 'restaurants', label: 'Restaurants', icon: Store },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartItems.length },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'profile', label: 'Profile', icon: User }
      ];
    } else if (user.role === 'owner') {
      return [
        { id: 'home', label: 'Dashboard', icon: ChefHat },
        { id: 'menu', label: 'Menu', icon: Store },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'profile', label: 'Profile', icon: User }
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
        { id: 'profile', label: 'Profile', icon: User }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <ChefHat className="text-orange-500" size={32} />
            <span className="text-2xl font-bold text-gray-800">EatEase</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition relative ${currentPage === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-orange-600 font-medium">{user.role.toUpperCase()}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${currentPage === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-orange-600 font-medium">{user.role.toUpperCase()}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
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