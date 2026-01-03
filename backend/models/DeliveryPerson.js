const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'bicycle', 'car'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  drivingLicense: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  activeOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  earnings: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  stats: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    onTimePercentage: { type: Number, default: 100 }
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  documents: {
    photo: String,
    licensePhoto: String,
    vehiclePhoto: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
deliveryPersonSchema.index({ currentLocation: '2dsphere' });
deliveryPersonSchema.index({ isAvailable: 1, isOnline: 1 });

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);