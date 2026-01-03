// models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant reference is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup', 'Snacks', 'Breakfast', 'Lunch', 'Dinner']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // Extra feature: Discounts
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  },
  // Calculated discounted price
  finalPrice: {
    type: Number
  },
  image: {
    type: String,
    default: 'default-food.jpg'
  },
  // Extra feature: Dietary information
  dietary: {
    type: [String],
    enum: ['vegetarian', 'vegan', 'non-veg', 'gluten-free', 'halal', 'jain', 'egg'],
    default: []
  },
  // Extra feature: Spice level
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot', 'none'],
    default: 'none'
  },
  // Extra feature: Nutritional info (optional)
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Extra feature: Popular item flag
  isPopular: {
    type: Boolean,
    default: false
  },
  // Extra feature: Item ratings
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
  // Extra feature: Preparation time
  preparationTime: {
    type: Number,
    default: 15 // in minutes
  },
  // Extra feature: Customization options
  customizations: [{
    name: String, // e.g., "Spice Level", "Add Extra Cheese"
    options: [{
      label: String, // e.g., "Extra Spicy", "No Onion"
      price: { type: Number, default: 0 }
    }]
  }]
}, {
  timestamps: true
});

// Calculate final price before saving
menuItemSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.finalPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.finalPrice = this.price;
  }
  next();
});

// Index for faster queries
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ dietary: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);