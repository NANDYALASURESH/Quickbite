// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // ================= BASIC REFERENCES =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },

    // ================= ORDER ITEMS =================
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true
        },
        name: String, // snapshot
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        customizations: [
          {
            name: String,
            selectedOption: String,
            additionalPrice: {
              type: Number,
              default: 0
            }
          }
        ],
        subtotal: Number
      }
    ],

    // ================= PRICING =================
    pricing: {
      subtotal: {
        type: Number,
        required: true
      },
      deliveryFee: {
        type: Number,
        default: 0
      },
      tax: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    },

    // ================= DELIVERY =================
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      landmark: String
    },

    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    },

    // ================= ORDER STATUS =================
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'out-for-delivery',
        'delivered',
        'cancelled'
      ],
      default: 'pending'
    },

    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ],

    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,

    // ================= CONTACT =================
    contactPhone: {
      type: String,
      required: true
    },

    specialInstructions: {
      type: String,
      maxlength: 200
    },

    // ================= PAYMENT (BASIC) =================
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },

    // ================= PAYMENT (ADVANCED) =================
    paymentDetails: {
      method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'wallet', 'razorpay', 'stripe']
      },
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      transactionId: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      stripePaymentIntentId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number
    },

    // ================= DELIVERY PERSON =================
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPerson',
      default: null
    },

    deliveryTracking: {
      assignedAt: Date,
      pickedUpAt: Date,
      deliveredAt: Date,
      currentLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: undefined
        }
      },
      estimatedArrival: Date
    },

    // ================= RATING =================
    rating: {
      food: { type: Number, min: 1, max: 5 },
      delivery: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 },
      review: String,
      reviewDate: Date
    },

    // ================= CANCELLATION =================
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ['user', 'restaurant', 'admin']
      },
      cancelledAt: Date
    }
  },
  {
    timestamps: true
  }
);

// ================= PRE-SAVE HOOK =================
orderSchema.pre('save', function (next) {
  // Calculate item subtotals
  this.items.forEach(item => {
    let customizationTotal = 0;
    if (item.customizations?.length) {
      customizationTotal = item.customizations.reduce(
        (sum, c) => sum + (c.additionalPrice || 0),
        0
      );
    }
    item.subtotal = (item.price + customizationTotal) * item.quantity;
  });

  // Track status changes
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }

  next();
});

// ================= INDEXES =================
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
