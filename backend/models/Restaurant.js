// models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  cuisine: {
    type: [String],
    required: [true, 'At least one cuisine type is required'],
    enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American', 'Continental', 'Fast Food', 'Desserts', 'Beverages']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  // Extra feature: Location coordinates for delivery radius
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
coordinates: {
  type: [Number], // [longitude, latitude]
  required: true,
  index: '2dsphere'
}

  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  // Extra feature: Operating hours
  openingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },
  // Extra feature: Restaurant ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Extra feature: Delivery settings
  deliverySettings: {
    isDeliveryAvailable: { type: Boolean, default: true },
    deliveryRadius: { type: Number, default: 5 }, // in kilometers
    minimumOrderAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: Number, default: 30 } // in minutes
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Extra feature: Featured restaurant
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Extra feature: Restaurant images
  images: {
    logo: String,
    banner: String,
    gallery: [String]
  },
  // Extra feature: Tax and service charges
  taxPercent: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for menu items
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurant'
});

// Create geospatial index for location-based queries
restaurantSchema.index({ location: '2dsphere' });

// Index for faster queries
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ cuisine: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);