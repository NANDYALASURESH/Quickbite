const express = require('express');
const router = express.Router();
const DeliveryPerson = require('../models/DeliveryPerson');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/delivery/register
 * @desc    Register as delivery person
 * @access  Private
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, drivingLicense } = req.body;

    // Check if already registered
    const existing = await DeliveryPerson.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    const deliveryPerson = await DeliveryPerson.create({
      user: req.user._id,
      vehicleType,
      vehicleNumber,
      drivingLicense
    });

    res.status(201).json({ success: true, deliveryPerson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/delivery/toggle-availability
 * @desc    Toggle online/offline status
 * @access  Private (Delivery Person)
 */
router.put('/toggle-availability', authenticate, async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });

    if (!deliveryPerson) {
      return res.status(404).json({ success: false, message: 'Not registered as delivery person' });
    }

    deliveryPerson.isOnline = !deliveryPerson.isOnline;
    deliveryPerson.isAvailable = deliveryPerson.isOnline && !deliveryPerson.activeOrder;

    await deliveryPerson.save();

    // Emit status change via socket
    const io = req.app.get('io');
    io.emit('delivery-person-status', {
      deliveryPersonId: deliveryPerson._id,
      isOnline: deliveryPerson.isOnline
    });

    res.json({ success: true, isOnline: deliveryPerson.isOnline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/delivery/status
 * @desc    Get current online status
 * @access  Private (Delivery Person)
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });

    if (!deliveryPerson) {
      return res.status(404).json({ success: false, message: 'Not registered' });
    }

    res.json({
      success: true,
      isOnline: deliveryPerson.isOnline,
      isAvailable: deliveryPerson.isAvailable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/delivery/update-location
 * @desc    Update current location
 * @access  Private (Delivery Person)
 */
router.put('/update-location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });

    if (!deliveryPerson) {
      return res.status(404).json({ success: false, message: 'Not registered' });
    }

    deliveryPerson.currentLocation.coordinates = [longitude, latitude];
    await deliveryPerson.save();

    // If delivering an order, update order tracking
    if (deliveryPerson.activeOrder) {
      const order = await Order.findById(deliveryPerson.activeOrder);
      if (order) {
        order.deliveryTracking.currentLocation.coordinates = [longitude, latitude];
        await order.save();

        // Emit location update via socket
        const io = req.app.get('io');
        io.to(`order-${order._id}`).emit('location-updated', {
          orderId: order._id,
          location: { latitude, longitude },
          timestamp: new Date()
        });
      }
    }

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/delivery/active-order
 * @desc    Get current active order
 * @access  Private (Delivery Person)
 */
router.get('/active-order', authenticate, async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });

    if (!deliveryPerson || !deliveryPerson.activeOrder) {
      return res.json({ success: true, order: null });
    }

    const order = await Order.findById(deliveryPerson.activeOrder)
      .populate('user', 'name phone')
      .populate('restaurant', 'name phone address');

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/delivery/update-order-status
 * @desc    Update order status (picked up, delivered)
 * @access  Private (Delivery Person)
 */
router.put('/update-order-status', authenticate, async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });
    const order = await Order.findById(orderId);

    if (!order || order.deliveryPerson.toString() !== deliveryPerson._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    order.status = status;

    if (status === 'out-for-delivery') {
      order.deliveryTracking.pickedUpAt = new Date();
    } else if (status === 'delivered') {
      order.deliveryTracking.deliveredAt = new Date();
      order.actualDeliveryTime = new Date();

      // Update delivery person stats
      deliveryPerson.isAvailable = true;
      deliveryPerson.activeOrder = null;
      deliveryPerson.stats.completedDeliveries += 1;
      deliveryPerson.stats.totalDeliveries += 1;

      // Add earnings (simplified - should be more complex in production)
      const deliveryFee = order.pricing.deliveryFee * 0.7; // 70% to delivery person
      deliveryPerson.earnings.today += deliveryFee;
      deliveryPerson.earnings.total += deliveryFee;

      await deliveryPerson.save();
    }

    await order.save();

    // Emit status update
    const io = req.app.get('io');
    io.to(`order-${orderId}`).emit('order-status-updated', {
      orderId,
      status,
      timestamp: new Date()
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/delivery/earnings
 * @desc    Get earnings summary
 * @access  Private (Delivery Person)
 */
router.get('/earnings', authenticate, async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findOne({ user: req.user._id });

    if (!deliveryPerson) {
      return res.status(404).json({ success: false, message: 'Not registered' });
    }

    res.json({
      success: true,
      earnings: deliveryPerson.earnings,
      stats: deliveryPerson.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
