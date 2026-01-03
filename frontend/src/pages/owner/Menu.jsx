import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Store } from 'lucide-react';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const OwnerMenu = () => {
  const { token, API_URL } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'Main Course', price: 0,
    discount: 0, dietary: [], spiceLevel: 'none', preparationTime: 15
  });

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup', 'Snacks', 'Breakfast', 'Lunch', 'Dinner'];
  const dietaryOptions = ['vegetarian', 'vegan', 'non-veg', 'gluten-free', 'halal', 'jain'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/owner/menu-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMenuItems(data.menuItems);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_URL}/owner/menu-items/${editingItem._id}`
        : `${API_URL}/owner/menu-items`;
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        fetchMenuItems();
        setShowModal(false);
        resetForm();
        alert(`Item ${editingItem ? 'updated' : 'added'} successfully!`);
      }
    } catch (error) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const response = await fetch(`${API_URL}/owner/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchMenuItems();
        alert('Item deleted');
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', category: 'Main Course', price: 0,
      discount: 0, dietary: [], spiceLevel: 'none', preparationTime: 15
    });
    setEditingItem(null);
  };

  const toggleDietary = (diet) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter(d => d !== diet)
        : [...prev.dietary, diet]
    }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No menu items yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setFormData({
                          name: item.name,
                          description: item.description,
                          category: item.category,
                          price: item.price,
                          discount: item.discount,
                          dietary: item.dietary || [],
                          spiceLevel: item.spiceLevel,
                          preparationTime: item.preparationTime
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-800">₹{item.finalPrice}</span>
                    {item.discount > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={editingItem ? 'Edit Item' : 'Add Item'}
          size="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <textarea
              required
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="number"
                required
                placeholder="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="number"
                placeholder="Discount (%)"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="number"
                placeholder="Prep Time (min)"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(diet => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDietary(diet)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${formData.dietary.includes(diet)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default OwnerMenu;