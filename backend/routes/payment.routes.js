const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const paymentService = require('../services/payment.service');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/payment/create-razorpay-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-razorpay-order', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await paymentService.createRazorpayOrder(
      orderId,
      order.pricing.total
    );

    if (result.success) {
      order.paymentDetails.razorpayOrderId = result.orderId;
      order.paymentDetails.status = 'processing';
      await order.save();
    }

    res.json(result);
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/payment/verify-razorpay
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify-razorpay', authenticate, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = paymentService.verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentDetails.status = 'completed';
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.paidAt = new Date();
    order.paymentStatus = 'completed';

    await order.save();

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/payment/create-stripe-intent
 * @desc    Create Stripe payment intent
 * @access  Private
 */
router.post('/create-stripe-intent', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await paymentService.createStripePaymentIntent(
      orderId,
      order.pricing.total
    );

    if (result.success) {
      order.paymentDetails.stripePaymentIntentId = result.paymentIntentId;
      order.paymentDetails.status = 'processing';
      await order.save();
    }

    res.json(result);
  } catch (error) {
    console.error('Create Stripe intent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/payment/stripe-webhook
 * @desc    Handle Stripe webhook events
 * @access  Public
 */
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentDetails.status = 'completed';
      order.paymentDetails.paidAt = new Date();
      order.paymentStatus = 'completed';
      await order.save();
    }
  }

  res.json({ received: true });
});

module.exports = router;