import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true,
    maxlength: [100, 'Menu item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['coffee', 'tea', 'pastries', 'sandwiches', 'salads', 'breakfast', 'lunch', 'dinner', 'desserts', 'beverages', 'snacks']
  },
  subcategory: {
    type: String,
    maxlength: [50, 'Subcategory cannot be more than 50 characters']
  },
  images: [{
    url: String,
    caption: String
  }],
  ingredients: [{
    ingredient: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number
  },
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'nuts', 'soy', 'eggs', 'shellfish', 'fish', 'sesame']
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'low-carb', 'organic']
  }],
  customizations: [{
    name: { type: String, required: true },
    options: [{
      name: { type: String, required: true },
      price: { type: Number, default: 0 }
    }],
    required: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false }
  }],
  translations: {
    type: Map,
    of: {
      name: String,
      description: String
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 10
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  orderCount: {
    type: Number,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes for performance
menuSchema.index({ cafeId: 1, category: 1 });
menuSchema.index({ cafeId: 1, isAvailable: 1 });
menuSchema.index({ cafeId: 1, displayOrder: 1 });

export default mongoose.model('Menu', menuSchema);