import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Edit2, Trash2, Search, Star } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const AdminRestaurants = () => {
  const { token, API_URL } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ isActive: true, isFeatured: false });

  useEffect(() => {
    fetchRestaurants();
  }, [filterActive]);

  const fetchRestaurants = async () => {
    try {
      let url = `${API_URL}/admin/restaurants`;
      if (filterActive !== '') {
        url += `?isActive=${filterActive}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setRestaurants(data.restaurants);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/restaurants/${selectedRestaurant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        fetchRestaurants();
        setShowModal(false);
        alert('Restaurant updated successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleDelete = async (restaurantId) => {
    if (!window.confirm('Delete this restaurant? All menu items will also be deleted.')) return;
    try {
      const response = await fetch(`${API_URL}/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchRestaurants();
        alert('Restaurant deleted successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredRestaurants = restaurants.filter(rest =>
    rest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rest.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Restaurants Management</h1>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterActive('')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterActive === '' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive('true')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterActive === 'true' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive('false')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterActive === 'false' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div key={restaurant._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                  <Store className="text-white" size={48} />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
                    {restaurant.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Owner:</strong> {restaurant.owner?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {restaurant.phone}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span className="font-semibold text-gray-800">
                        {restaurant.rating.average || 'New'}
                      </span>
                      {restaurant.rating.count > 0 && (
                        <span className="text-gray-500 text-sm">
                          ({restaurant.rating.count})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        setFormData({
                          isActive: restaurant.isActive,
                          isFeatured: restaurant.isFeatured
                        });
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Edit Restaurant"
        >
          {selectedRestaurant && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedRestaurant.name}</h3>
                <p className="text-gray-600 text-sm">
                  <strong>Owner:</strong> {selectedRestaurant.owner?.name}<br />
                  <strong>Email:</strong> {selectedRestaurant.email}<br />
                  <strong>Phone:</strong> {selectedRestaurant.phone}
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Featured Restaurant</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Update Restaurant
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminRestaurants;