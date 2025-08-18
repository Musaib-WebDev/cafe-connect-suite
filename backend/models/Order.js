import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest orders
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // For takeout/delivery orders
  },
  tableNumber: {
    type: Number,
    required: false
  },
  items: [{
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customizations: [{
      name: String,
      options: [String],
      additionalPrice: { type: Number, default: 0 }
    }],
    specialInstructions: String,
    subtotal: { type: Number, required: true }
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promotionCode: String,
    tip: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeout', 'delivery'],
    default: 'dine-in'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    instructions: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital-wallet', 'online'],
    default: 'cash'
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot be more than 500 characters']
  },
  estimatedReadyTime: Date,
  actualReadyTime: Date,
  servedTime: Date,
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add indexes for performance
orderSchema.index({ cafeId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);