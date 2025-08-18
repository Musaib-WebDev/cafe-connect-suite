import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a promotion name'],
    trim: true,
    maxlength: [100, 'Promotion name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  code: {
    type: String,
    required: [true, 'Please add a promotion code'],
    uppercase: true,
    trim: true,
    maxlength: [20, 'Promotion code cannot be more than 20 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed-amount', 'buy-one-get-one', 'free-item'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add a discount value'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number
  },
  applicableItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }],
  applicableCategories: [{
    type: String
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    total: { type: Number },
    perCustomer: { type: Number, default: 1 }
  },
  usageCount: {
    total: { type: Number, default: 0 },
    byCustomer: [{
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      count: { type: Number, default: 0 }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new-customers', 'returning-customers', 'vip-customers'],
    default: 'all'
  },
  dayOfWeekRestrictions: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  timeRestrictions: {
    startTime: String,
    endTime: String
  }
}, {
  timestamps: true
});

// Ensure unique code per cafe
promotionSchema.index({ cafeId: 1, code: 1 }, { unique: true });

// Add other indexes for performance
promotionSchema.index({ cafeId: 1, isActive: 1 });
promotionSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if promotion is currently valid
promotionSchema.methods.isCurrentlyValid = function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (!this.usageLimit.total || this.usageCount.total < this.usageLimit.total);
};

export default mongoose.model('Promotion', promotionSchema);