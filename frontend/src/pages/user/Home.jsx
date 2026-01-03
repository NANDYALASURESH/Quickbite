import homeHeroImage from '../../assets/home_hero.png';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Star, Clock, TrendingUp, Search, ChefHat } from 'lucide-react';
import Loader from '../../components/Loader';

const UserHome = ({ setCurrentPage }) => {
  const { token, API_URL } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-[500px]"
        style={{
          backgroundImage: `url(${homeHeroImage})`
          // backgroundColor: '#333'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" /> {/* Dark Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Delicious Food, <span className="text-orange-500">Delivered</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Order from your favorite restaurants and get it delivered to your doorstep in minutes.
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition" size={24} />
              <input
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-full text-gray-800 text-lg shadow-2xl focus:ring-4 focus:ring-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Store className="mx-auto text-orange-500 mb-2" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">{restaurants.length}</h3>
            <p className="text-gray-600">Restaurants</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <ChefHat className="mx-auto text-orange-500 mb-2" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">500+</h3>
            <p className="text-gray-600">Menu Items</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Star className="mx-auto text-orange-500 mb-2" size={40} />
            <h3 className="text-3xl font-bold text-gray-800">4.5+</h3>
            <p className="text-gray-600">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Featured Restaurants</h2>
          <button
            onClick={() => setCurrentPage('restaurants')}
            className="text-orange-500 font-semibold hover:text-orange-600 transition"
          >
            View All →
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.slice(0, 6).map(restaurant => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer card-hover"
                onClick={() => {
                  localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
                  setCurrentPage('restaurants');
                }}
              >
                <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                  <Store className="text-white" size={64} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="text-yellow-500 fill-current" size={20} />
                      <span className="font-semibold text-gray-800">
                        {restaurant.rating.average || 'New'}
                      </span>
                      {restaurant.rating.count > 0 && (
                        <span className="text-gray-500 text-sm">
                          ({restaurant.rating.count})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">
                        {restaurant.deliverySettings.estimatedDeliveryTime} min
                      </span>
                    </div>
                  </div>

                  {!restaurant.isActive && (
                    <div className="mt-4 text-center py-2 bg-red-100 text-red-600 rounded-lg font-medium">
                      Currently Closed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;