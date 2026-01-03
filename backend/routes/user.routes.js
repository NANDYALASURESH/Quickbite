// routes/user.routes.js
const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication as 'user'
router.use(authenticate);
router.use(authorize('user'));

/**
 * @route   GET /api/user/restaurants
 * @desc    Get all active restaurants with filters
 * @access  Private (User)
 */
router.get('/restaurants', async (req, res) => {
  try {
    const { cuisine, search, featured, sortBy } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const restaurants = await Restaurant.find(query)
      .sort(sort)
      .select('-__v')
      .populate('owner', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
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
 * @route   GET /api/user/restaurants/:id
 * @desc    Get single restaurant details with menu
 * @access  Private (User)
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
    
    // Get menu items for this restaurant
    const menuItems = await MenuItem.find({ 
      restaurant: req.params.id,
      isAvailable: true 
    });
    
    res.status(200).json({
      success: true,
      restaurant,
      menuItems
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
 * @route   GET /api/user/menu/:restaurantId
 * @desc    Get menu items for a restaurant with filters
 * @access  Private (User)
 */
router.get('/menu/:restaurantId', async (req, res) => {
  try {
    const { category, dietary, maxPrice, search } = req.query;
    
    const query = { 
      restaurant: req.params.restaurantId,
      isAvailable: true 
    };
    
    if (category) {
      query.category = category;
    }
    
    if (dietary) {
      query.dietary = { $in: dietary.split(',') };
    }
    
    if (maxPrice) {
      query.finalPrice = { $lte: parseFloat(maxPrice) };
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name');
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems
    });
    
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch menu', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/user/orders
 * @desc    Place a new order
 * @access  Private (User)
 */
router.post('/orders', async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, specialInstructions, contactPhone } = req.body;
    
    // Validation
    if (!restaurantId || !items || items.length === 0 || !deliveryAddress || !paymentMethod || !contactPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }
    
    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ 
          success: false, 
          message: `Item ${menuItem ? menuItem.name : 'unknown'} is not available` 
        });
      }
      
      let itemPrice = menuItem.finalPrice;
      const customizations = item.customizations || [];
      
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: itemPrice,
        customizations: customizations
      });
      
      subtotal += itemPrice * item.quantity;
    }
    
    // Calculate pricing
    const deliveryFee = restaurant.deliverySettings.deliveryFee;
    const tax = (subtotal * restaurant.taxPercent) / 100;
    const total = subtotal + deliveryFee + tax;
    
    // Check minimum order amount
    if (subtotal < restaurant.deliverySettings.minimumOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount is ₹${restaurant.deliverySettings.minimumOrderAmount}` 
      });
    }
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      },
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      contactPhone,
      estimatedDeliveryTime: new Date(Date.now() + restaurant.deliverySettings.estimatedDeliveryTime * 60000)
    });
    
    // Award loyalty points (1 point per ₹100 spent)
    const pointsEarned = Math.floor(total / 100);
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { loyaltyPoints: pointsEarned }
    });
    
    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name phone address')
      .populate('items.menuItem', 'name image');
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder,
      pointsEarned
    });
    
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place order', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/user/orders
 * @desc    Get user's order history
 * @access  Private (User)
 */
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('restaurant', 'name phone address images')
      .populate('items.menuItem', 'name image');
    
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
 * @route   GET /api/user/orders/:id
 * @desc    Get single order details
 * @access  Private (User)
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })
      .populate('restaurant', 'name phone address images')
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
 * @route   PUT /api/user/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private (User)
 */
router.put('/orders/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }
    
    order.status = 'cancelled';
    order.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: 'user',
      cancelledAt: new Date()
    };
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/user/orders/:id/rating
 * @desc    Rate an order
 * @access  Private (User)
 */
router.post('/orders/:id/rating', async (req, res) => {
  try {
    const { food, delivery, review } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only rate delivered orders' 
      });
    }
    
    if (order.rating && order.rating.overall) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order already rated' 
      });
    }
    
    const overall = ((food + delivery) / 2).toFixed(1);
    
    order.rating = {
      food,
      delivery,
      overall,
      review,
      reviewDate: new Date()
    };
    
    await order.save();
    
    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurant);
    const allRatings = await Order.find({ 
      restaurant: order.restaurant, 
      'rating.overall': { $exists: true } 
    });
    
    const avgRating = allRatings.reduce((sum, ord) => sum + ord.rating.overall, 0) / allRatings.length;
    
    restaurant.rating.average = avgRating.toFixed(1);
    restaurant.rating.count = allRatings.length;
    await restaurant.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      order
    });
    
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit rating', 
      error: error.message 
    });
  }
});

module.exports = router;