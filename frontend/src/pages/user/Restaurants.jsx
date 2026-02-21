import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Store, Star, Clock, Plus, Minus, ShoppingCart, X, Search, Filter } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

// Updated: 2026-01-25 05:50 - Images should now display
const UserRestaurants = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract unique cuisines for filter buttons
  const uniqueCuisines = [...new Set(restaurants.flatMap(r => r.cuisine))].sort();

  // Filter restaurants based on search and category
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || restaurant.cuisine.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchRestaurants();
    const saved = localStorage.getItem('selectedRestaurant');
    if (saved) {
      const rest = JSON.parse(saved);
      setSelectedRestaurant(rest);
      fetchMenu(rest._id);
      localStorage.removeItem('selectedRestaurant');
    }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/user/restaurants`, {
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

  const fetchMenu = async (restaurantId) => {
    try {
      const response = await fetch(`${API_URL}/user/menu/${restaurantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    // Reset internal menu search when entering a restaurant
    // If you want to keep the search term from the list view, pass it here
    // For now, we'll clear it for the menu view to avoid confusion
    // But since the menu view uses its OWN searchTerm state (if we separate them), or reuses this one
    // In this file, you have ONE state 'searchTerm'.
    // Better to clear it for the menu view or let the user type again.
    setSearchTerm('');
    fetchMenu(restaurant._id);
  };

  const handleAddToCart = (item) => {
    addToCart(item, selectedRestaurant);
  };

  // Menu Search Filter (Reusing the same logic or separate?)
  // The component currently has ONE searchTerm state.
  // The original code used it for MENU filtering inside the `if (selectedRestaurant)` block.
  // We need to decide: Share state or reset?
  // Let's use separate variables for clarity if needed, but for now, reusing `searchTerm` is tricky if we want to preserve list search.
  // Simple approach: When viewing menu, `searchTerm` filters menu. When viewing list, `searchTerm` filters list.
  // I cleared it above in handleRestaurantClick, so it starts fresh for the menu.

  const menuCategories = [...new Set(menuItems.map(item => item.category))];

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loader />;

  if (selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Restaurant Header */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setSearchTerm(''); // Clear menu search when going back
                setSelectedCategory('');
              }}
              className="mb-4 flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition"
            >
              <X size={20} />
              <span>Back to Restaurants</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedRestaurant.name}
                </h1>
                <p className="text-gray-600 mb-4">{selectedRestaurant.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRestaurant.cuisine.map((cuisine, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-500 fill-current" size={18} />
                    <span className="font-semibold">
                      {selectedRestaurant.rating.average || 'New'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} />
                    <span>{selectedRestaurant.deliverySettings.estimatedDeliveryTime} min</span>
                  </div>
                  <div>
                    Min Order: ₹{selectedRestaurant.deliverySettings.minimumOrderAmount}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition relative"
              >
                <ShoppingCart size={20} />
                <span>View Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg font-medium transition ${!selectedCategory
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                All
              </button>
              {menuCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredMenu.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map(item => {
                const inCart = cartItems.find(ci => ci._id === item._id);
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-r from-orange-300 to-red-300 flex items-center justify-center">
                        <Store className="text-white" size={48} />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                        {item.dietary && item.dietary.length > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.dietary.includes('veg') || item.dietary.includes('vegetarian')
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                            }`}>
                            {item.dietary[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-gray-800">
                            ₹{item.finalPrice}
                          </span>
                          {item.discount > 0 && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                        {item.discount > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>

                      {inCart ? (
                        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                          >
                            <Plus size={16} />
                          </button>
                          <span className="font-bold text-gray-800">{inCart.quantity}</span>
                          <button className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                            <Minus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                          <Plus size={18} />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">All Restaurants 🍽️</h1>

        {/* Search and Filter Section for Restaurants */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            {uniqueCuisines.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => setSelectedCategory(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cuisine
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer card-hover"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                {restaurant.images && restaurant.images[0] ? (
                  <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                    }}
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <Store className="text-white" size={64} />
                  </div>
                )}
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
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock size={16} />
                      <span className="text-sm">{restaurant.deliverySettings.estimatedDeliveryTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRestaurants;