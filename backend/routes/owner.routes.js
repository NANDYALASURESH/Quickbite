// routes/owner.routes.js
const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication as 'owner'
router.use(authenticate);
router.use(authorize('owner'));

/**
 * @route   POST /api/owner/restaurants
 * @desc    Create a new restaurant
 * @access  Private (Owner)
 */
router.post(
  '/restaurants',
  authenticate,
  authorize('owner'),
  async (req, res) => {
    try {
      const {
        name,
        description,
        cuisine,
        latitude,
        longitude,
        address,
        phone,
        email,
        openingHours,
        deliverySettings,
        images,
        taxPercent
      } = req.body;

      // 🔹 Basic validation
      if (
        !name ||
        !description ||
        !cuisine ||
        !address ||
        !phone ||
        !email
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // 🔹 Location validation
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Location coordinates [longitude, latitude] are required'
        });
      }

      // 🔹 Only one restaurant per owner
      const existingRestaurant = await Restaurant.findOne({
        owner: req.user._id
      });

      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'You already own a restaurant'
        });
      }

      // 🔹 Create restaurant with GeoJSON location
      const restaurant = await Restaurant.create({
        name,
        owner: req.user._id,
        description,
        cuisine,
        address,
        phone,
        email,
        openingHours,
        deliverySettings,
        images,
        taxPercent: taxPercent || 5,
        location: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        restaurant
      });

    } catch (error) {
      console.error('Create restaurant error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create restaurant',
        error: error.message
      });
    }
  }
);




/**
 * @route   GET /api/owner/restaurants/my-restaurant
 * @desc    Get owner's restaurant
 * @access  Private (Owner)
 */
router.get('/restaurants/my-restaurant', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
      .populate('owner', 'name email phone');
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'No restaurant found. Please create one.' 
      });
    }
    
    // Get menu items count
    const menuItemsCount = await MenuItem.countDocuments({ restaurant: restaurant._id });
    
    res.status(200).json({
      success: true,
      restaurant,
      menuItemsCount
    });
    
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch restaurant', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/owner/restaurants/:id
 * @desc    Update restaurant details
 * @access  Private (Owner)
 */
router.put('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found or you do not have permission' 
      });
    }
    
    // Fields that can be updated
    const allowedUpdates = ['name', 'description', 'cuisine', 'address', 'phone', 'email', 'openingHours', 'deliverySettings', 'images', 'taxPercent', 'isActive'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    });
    
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update restaurant', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/owner/menu-items
 * @desc    Add a new menu item
 * @access  Private (Owner)
 */
router.post('/menu-items', async (req, res) => {
  try {
    // Get owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Please create a restaurant first' 
      });
    }
    
    const { name, description, category, price, discount, image, dietary, spiceLevel, nutritionalInfo, preparationTime, customizations } = req.body;
    
    // Validation
    if (!name || !description || !category || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    // Create menu item
    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      name,
      description,
      category,
      price,
      discount: discount || 0,
      image,
      dietary,
      spiceLevel,
      nutritionalInfo,
      preparationTime,
      customizations
    });
    
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menuItem
    });
    
  } catch (error) {
    console.error('Add menu item error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages[0] 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add menu item', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/owner/menu-items
 * @desc    Get all menu items for owner's restaurant
 * @access  Private (Owner)
 */
router.get('/menu-items', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const { category, isAvailable } = req.query;
    
    const query = { restaurant: restaurant._id };
    
    if (category) {
      query.category = category;
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    
    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems
    });
    
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch menu items', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/owner/menu-items/:id
 * @desc    Update a menu item
 * @access  Private (Owner)
 */
router.put('/menu-items/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const menuItem = await MenuItem.findOne({ 
      _id: req.params.id, 
      restaurant: restaurant._id 
    });
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found or you do not have permission' 
      });
    }
    
    // Fields that can be updated
    const allowedUpdates = ['name', 'description', 'category', 'price', 'discount', 'image', 'dietary', 'spiceLevel', 'nutritionalInfo', 'isAvailable', 'preparationTime', 'customizations', 'isPopular'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });
    
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update menu item', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/owner/menu-items/:id
 * @desc    Delete a menu item
 * @access  Private (Owner)
 */
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const menuItem = await MenuItem.findOne({ 
      _id: req.params.id, 
      restaurant: restaurant._id 
    });
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found or you do not have permission' 
      });
    }
    
    await MenuItem.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete menu item', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/owner/orders
 * @desc    Get orders for owner's restaurant
 * @access  Private (Owner)
 */
router.get('/orders', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const { status, date, page = 1, limit = 20 } = req.query;
    
    const query = { restaurant: restaurant._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name phone')
      .populate('items.menuItem', 'name');
    
    const count = await Order.countDocuments(query);
    
    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== 'cancelled') {
        return sum + order.pricing.total;
      }
      return sum;
    }, 0);
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalRevenue,
      orders
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/owner/orders/:id/status
 * @desc    Update order status
 * @access  Private (Owner)
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      restaurant: restaurant._id 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or you do not have permission' 
      });
    }
    
    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    order.status = status;
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    if (status === 'cancelled') {
      order.cancellation = {
        reason: note || 'Cancelled by restaurant',
        cancelledBy: 'restaurant',
        cancelledAt: new Date()
      };
    }
    
    // Add note to status history if provided
    if (note && order.statusHistory.length > 0) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/owner/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Owner)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get statistics
    const [totalOrders, todayOrders, pendingOrders, totalMenuItems] = await Promise.all([
      Order.countDocuments({ restaurant: restaurant._id }),
      Order.countDocuments({ 
        restaurant: restaurant._id,
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Order.countDocuments({ 
        restaurant: restaurant._id,
        status: { $in: ['pending', 'confirmed', 'preparing'] }
      }),
      MenuItem.countDocuments({ restaurant: restaurant._id })
    ]);
    
    // Calculate total revenue
    const orders = await Order.find({ 
      restaurant: restaurant._id,
      status: { $ne: 'cancelled' }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    
    // Today's revenue
    const todayRevenue = orders
      .filter(order => new Date(order.createdAt) >= today)
      .reduce((sum, order) => sum + order.pricing.total, 0);
    
    res.status(200).json({
      success: true,
      dashboard: {
        restaurant: {
          name: restaurant.name,
          rating: restaurant.rating.average,
          totalReviews: restaurant.rating.count
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue
        },
        menu: {
          totalItems: totalMenuItems
        }
      }
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard', 
      error: error.message 
    });
  }
});

module.exports = router;// Add this route before module.exports

/**
 * @route   PUT /api/owner/orders/:id/assign-delivery
 * @desc    Assign delivery person to order
 * @access  Private (Owner)
 */
router.put('/orders/:id/assign-delivery', async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    
    if (!deliveryPersonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery person ID is required' 
      });
    }
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      restaurant: restaurant._id 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or you do not have permission' 
      });
    }
    
    // Check if delivery person exists and is available
    const DeliveryPerson = require('../models/DeliveryPerson');
    const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
    
    if (!deliveryPerson) {
      return res.status(404).json({ 
        success: false, 
        message: 'Delivery person not found' 
      });
    }
    
    if (!deliveryPerson.isAvailable || !deliveryPerson.isOnline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery person is not available' 
      });
    }
    
    // Assign delivery person
    order.deliveryPerson = deliveryPersonId;
    order.status = 'confirmed';
    await order.save();
    
    // Update delivery person
    deliveryPerson.activeOrder = order._id;
    deliveryPerson.isAvailable = false;
    await deliveryPerson.save();
    
    res.status(200).json({
      success: true,
      message: 'Delivery person assigned successfully',
      order
    });
    
  } catch (error) {
    console.error('Assign delivery person error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to assign delivery person', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/owner/available-delivery-persons
 * @desc    Get list of available delivery persons
 * @access  Private (Owner)
 */
router.get('/available-delivery-persons', async (req, res) => {
  try {
    const DeliveryPerson = require('../models/DeliveryPerson');
    
    const deliveryPersons = await DeliveryPerson.find({
      isOnline: true,
      isAvailable: true
    }).populate('user', 'name phone');
    
    res.status(200).json({
      success: true,
      count: deliveryPersons.length,
      deliveryPersons
    });
    
  } catch (error) {
    console.error('Get delivery persons error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch delivery persons', 
      error: error.message 
    });
  }
});
