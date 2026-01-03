// routes/admin.routes.js
const express = require('express');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication as 'admin'
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Private (Admin)
 */
router.get('/users', async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Private (Admin)
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get additional stats
    let stats = {};
    
    if (user.role === 'user') {
      const orderCount = await Order.countDocuments({ user: user._id });
      const orders = await Order.find({ user: user._id, status: { $ne: 'cancelled' } });
      const totalSpent = orders.reduce((sum, order) => sum + order.pricing.total, 0);
      
      stats = { orderCount, totalSpent };
    } else if (user.role === 'owner') {
      const restaurant = await Restaurant.findOne({ owner: user._id });
      if (restaurant) {
        const orderCount = await Order.countDocuments({ restaurant: restaurant._id });
        const orders = await Order.find({ restaurant: restaurant._id, status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
        
        stats = { 
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          orderCount, 
          totalRevenue 
        };
      }
    }
    
    res.status(200).json({
      success: true,
      user,
      stats
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (role, active status)
 * @access  Private (Admin)
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }
    
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/restaurants
 * @desc    Get all restaurants with filters
 * @access  Private (Admin)
 */
router.get('/restaurants', async (req, res) => {
  try {
    const { isActive, cuisine, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Restaurant.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      restaurants
    });
    
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch restaurants', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/restaurants/:id
 * @desc    Get single restaurant details
 * @access  Private (Admin)
 */
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    // Get menu items count
    const menuItemsCount = await MenuItem.countDocuments({ restaurant: restaurant._id });
    
    // Get orders count and revenue
    const orderCount = await Order.countDocuments({ restaurant: restaurant._id });
    const orders = await Order.find({ restaurant: restaurant._id, status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    
    res.status(200).json({
      success: true,
      restaurant,
      stats: {
        menuItemsCount,
        orderCount,
        totalRevenue
      }
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
 * @route   PUT /api/admin/restaurants/:id
 * @desc    Update restaurant (admin can update any field)
 * @access  Private (Admin)
 */
router.put('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
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
 * @route   DELETE /api/admin/restaurants/:id
 * @desc    Delete a restaurant
 * @access  Private (Admin)
 */
router.delete('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    // Delete all menu items for this restaurant
    await MenuItem.deleteMany({ restaurant: req.params.id });
    
    // Delete restaurant
    await Restaurant.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Restaurant and its menu items deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete restaurant', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters
 * @access  Private (Admin)
 */
router.get('/orders', async (req, res) => {
  try {
    const { status, restaurantId, userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (restaurantId) {
      query.restaurant = restaurantId;
    }
    
    if (userId) {
      query.user = userId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name phone')
      .populate('items.menuItem', 'name');
    
    const count = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
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
 * @route   GET /api/admin/orders/:id
 * @desc    Get single order details
 * @access  Private (Admin)
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name phone address')
      .populate('items.menuItem', 'name image description');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order (admin can update any field including cancellation)
 * @access  Private (Admin)
 */
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    if (status) {
      order.status = status;
      
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
      }
      
      if (status === 'cancelled') {
        order.cancellation = {
          reason: note || 'Cancelled by admin',
          cancelledBy: 'admin',
          cancelledAt: new Date()
        };
      }
      
      await order.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
    
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard with overall statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const [totalUsers, totalRestaurants, totalOrders, totalMenuItems] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      MenuItem.countDocuments()
    ]);
    
    // Get role distribution
    const [userCount, ownerCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'admin' })
    ]);
    
    // Get active vs inactive counts
    const [activeUsers, activeRestaurants] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isActive: true })
    ]);
    
    // Calculate total revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const todayRevenue = orders
      .filter(order => new Date(order.createdAt) >= today)
      .reduce((sum, order) => sum + order.pricing.total, 0);
    
    // Get order status distribution
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top restaurants by orders
    const topRestaurants = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$restaurant',
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      { $unwind: '$restaurant' },
      {
        $project: {
          name: '$restaurant.name',
          orderCount: 1,
          totalRevenue: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalUsers,
          totalRestaurants,
          totalOrders,
          totalMenuItems,
          totalRevenue
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          byRole: {
            users: userCount,
            owners: ownerCount,
            admins: adminCount
          }
        },
        restaurants: {
          total: totalRestaurants,
          active: activeRestaurants,
          inactive: totalRestaurants - activeRestaurants
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          byStatus: orderStats
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue
        },
        topRestaurants
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

module.exports = router;