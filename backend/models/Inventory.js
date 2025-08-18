import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  ingredient: {
    type: String,
    required: [true, 'Please add an ingredient name'],
    trim: true,
    maxlength: [100, 'Ingredient name cannot be more than 100 characters']
  },
  category: {
    type: String,
    enum: ['dairy', 'meat', 'vegetables', 'fruits', 'grains', 'spices', 'beverages', 'condiments', 'other'],
    default: 'other'
  },
  currentQuantity: {
    type: Number,
    required: [true, 'Please add current quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit'],
    enum: ['kg', 'g', 'lbs', 'oz', 'l', 'ml', 'cups', 'pieces', 'packets', 'bottles', 'cans']
  },
  minimumThreshold: {
    type: Number,
    required: [true, 'Please add minimum threshold'],
    min: [0, 'Minimum threshold cannot be negative']
  },
  maximumCapacity: {
    type: Number,
    min: [0, 'Maximum capacity cannot be negative']
  },
  costPerUnit: {
    type: Number,
    min: [0, 'Cost per unit cannot be negative']
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  lastRestocked: {
    date: Date,
    quantity: Number,
    cost: Number
  },
  expiryDate: Date,
  batchNumber: String,
  location: {
    type: String,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stockMovements: [{
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'waste'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['low-stock', 'out-of-stock', 'expiring-soon', 'expired'],
      required: true
    },
    message: String,
    isResolved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date
  }]
}, {
  timestamps: true
});

// Update low stock status before saving
inventorySchema.pre('save', function(next) {
  this.isLowStock = this.currentQuantity <= this.minimumThreshold;
  next();
});

// Method to add stock movement and update quantity
inventorySchema.methods.addStockMovement = function(type, quantity, reason, orderId, notes) {
  this.stockMovements.push({
    type,
    quantity,
    reason,
    orderId,
    notes
  });

  if (type === 'in') {
    this.currentQuantity += quantity;
  } else if (type === 'out' || type === 'waste') {
    this.currentQuantity -= quantity;
  } else if (type === 'adjustment') {
    this.currentQuantity = quantity; // Set to exact quantity for adjustments
  }

  // Ensure quantity doesn't go below 0
  if (this.currentQuantity < 0) {
    this.currentQuantity = 0;
  }

  return this.save();
};

// Method to create alerts
inventorySchema.methods.createAlert = function(type, message) {
  // Check if alert of same type already exists and is not resolved
  const existingAlert = this.alerts.find(alert => 
    alert.type === type && !alert.isResolved
  );

  if (!existingAlert) {
    this.alerts.push({
      type,
      message: message || `${type} alert for ${this.ingredient}`
    });
  }

  return this.save();
};

// Add indexes for performance
inventorySchema.index({ cafeId: 1, ingredient: 1 }, { unique: true });
inventorySchema.index({ cafeId: 1, isLowStock: 1 });
inventorySchema.index({ cafeId: 1, category: 1 });

export default mongoose.model('Inventory', inventorySchema);