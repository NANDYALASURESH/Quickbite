import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Store, Star, Clock, Search, ChefHat,
  Heart, X, ArrowRight, MapPin, TrendingUp, Award
} from 'lucide-react';
import Loader from '../../components/Loader';
import homeHeroImage from '../../assets/home_hero.png';

const UserHome = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/user/restaurants?sortBy=rating`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'italian', name: 'Italian', icon: '🍕' },
    { id: 'indian', name: 'Indian', icon: '🍛' },
    { id: 'chinese', name: 'Chinese', icon: '🍜' },
    { id: 'american', name: 'American', icon: '🍔' },
    { id: 'mexican', name: 'Mexican', icon: '🌮' },
  ];

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
      r.cuisine.some(c => c.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (restaurantId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(restaurantId)) {
        newFavorites.delete(restaurantId);
      } else {
        newFavorites.add(restaurantId);
      }
      return newFavorites;
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${homeHeroImage})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <ChefHat className="w-4 h-4" />
              <span className="text-sm font-medium">QuickBite - Fast & Fresh Delivery</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Craving Something
              <span className="block text-yellow-300">Delicious?</span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 mb-8">
              Order from {restaurants.length}+ restaurants and get it delivered to your doorstep in minutes.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl text-gray-800 shadow-lg focus:ring-4 focus:ring-orange-300 outline-none transition-all bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>

        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === category.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'All Restaurants' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Restaurants`}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{filteredRestaurants.length} restaurants available</p>
          </div>

          <button
            onClick={() => navigate('/restaurants')}
            className="hidden sm:flex items-center space-x-2 text-orange-500 font-semibold hover:text-orange-600 transition"
          >
            <span>View All</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <Store className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div
                key={restaurant._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                onClick={() => {
                  localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
                  navigate('/restaurants');
                }}
              >
                {/* Restaurant Image */}
                <div className="relative h-56 overflow-hidden">
                  {restaurant.images && restaurant.images[0] ? (
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://source.unsplash.com/800x600/?${restaurant.cuisine[0].toLowerCase()}-food,restaurant`;
                      }}
                    />
                  ) : (
                    <img
                      src={`https://source.unsplash.com/800x600/?${restaurant.cuisine[0].toLowerCase()}-food,restaurant`}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://source.unsplash.com/800x600/?food,restaurant`;
                      }}
                    />
                  )}

                  {/* Gradient Overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(restaurant._id, e)}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all z-10 ${favorites.has(restaurant._id)
                      ? 'bg-white text-red-500 scale-110'
                      : 'bg-white/90 text-gray-600 hover:text-red-500 hover:scale-110'
                      }`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.has(restaurant._id) ? 'currentColor' : 'none'}
                      strokeWidth={2}
                    />
                  </button>

                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg ${restaurant.isActive
                    ? 'bg-green-500/90 text-white'
                    : 'bg-gray-800/90 text-white'
                    }`}>
                    <div className="flex items-center space-x-1.5">
                      {restaurant.isActive && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      )}
                      <span>{restaurant.isActive ? 'Open Now' : 'Closed'}</span>
                    </div>
                  </div>

                  {/* Restaurant Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                      {restaurant.name}
                    </h3>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                    {restaurant.description}
                  </p>

                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-md text-xs font-medium"
                      >
                        {cuisine}
                      </span>
                    ))}
                    {restaurant.cuisine.length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                        +{restaurant.cuisine.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Rating and Time */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span className="font-semibold text-gray-800 text-sm">
                        {restaurant.rating.average || 'New'}
                      </span>
                      {restaurant.rating.count > 0 && (
                        <span className="text-gray-500 text-xs">
                          ({restaurant.rating.count})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock size={14} />
                      <span className="text-xs font-medium">
                        {restaurant.deliverySettings.estimatedDeliveryTime} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Store className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{restaurants.length}+</h3>
              <p className="text-sm text-gray-600">Restaurants</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChefHat className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">500+</h3>
              <p className="text-sm text-gray-600">Menu Items</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">4.5+</h3>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;