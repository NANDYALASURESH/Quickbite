const Razorpay = require('razorpay');
const stripe = require('stripe');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    this.stripe = stripe(process.env.STRIPE_SECRET_KEY);
  }

  // Create Razorpay Order
  async createRazorpayOrder(orderId, amount) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        receipt: orderId.toString(),
        payment_capture: 1
      };

      const razorpayOrder = await this.razorpay.orders.create(options);
      return {
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return { success: false, message: error.message };
    }
  }

  // Verify Razorpay Payment
  verifyRazorpayPayment(orderId, paymentId, signature) {
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generated_signature === signature;
  }

  // Create Stripe Payment Intent
  async createStripePaymentIntent(orderId, amount) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency: 'inr',
        metadata: {
          orderId: orderId.toString()
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      return { success: false, message: error.message };
    }
  }

  // Process Refund
  async processRefund(orderId, amount, method, transactionId) {
    try {
      if (method === 'razorpay') {
        const refund = await this.razorpay.payments.refund(transactionId, {
          amount: Math.round(amount * 100)
        });
        return { success: true, refundId: refund.id };
      } else if (method === 'stripe') {
        const refund = await this.stripe.refunds.create({
          payment_intent: transactionId,
          amount: Math.round(amount * 100)
        });
        return { success: true, refundId: refund.id };
      }
      return { success: false, message: 'Unsupported payment method' };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new PaymentService();