import mongoose from 'mongoose';

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a cafe name'],
    trim: true,
    maxlength: [100, 'Cafe name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  tables: [{
    number: { type: Number, required: true },
    capacity: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    qrCode: String
  }],
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'outdoor-seating', 'pet-friendly', 'wheelchair-accessible', 'live-music', 'delivery', 'takeout']
  }],
  cuisine: [{
    type: String,
    enum: ['coffee', 'pastries', 'sandwiches', 'salads', 'breakfast', 'lunch', 'dinner', 'desserts', 'beverages']
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    expiresAt: Date
  },
  settings: {
    allowOnlineOrders: { type: Boolean, default: true },
    allowReservations: { type: Boolean, default: true },
    autoAcceptOrders: { type: Boolean, default: false },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Add indexes for performance
cafeSchema.index({ ownerId: 1 });
cafeSchema.index({ location: '2dsphere' });
cafeSchema.index({ 'address.city': 1 });
cafeSchema.index({ isActive: 1 });

export default mongoose.model('Cafe', cafeSchema);