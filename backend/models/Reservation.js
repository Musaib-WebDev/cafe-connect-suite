import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest reservations
  },
  reservationNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  tableNumber: {
    type: Number,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  reservationDate: {
    type: Date,
    required: true
  },
  reservationTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 120 // minutes
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot be more than 500 characters']
  },
  occasion: {
    type: String,
    enum: ['birthday', 'anniversary', 'business', 'date', 'family', 'other']
  },
  seatingPreference: {
    type: String,
    enum: ['indoor', 'outdoor', 'window', 'quiet', 'no-preference'],
    default: 'no-preference'
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  completedAt: Date,
  notes: String,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

// Generate reservation number before saving
reservationSchema.pre('save', async function(next) {
  if (!this.reservationNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    this.reservationNumber = `RES-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add indexes for performance
reservationSchema.index({ cafeId: 1, reservationDate: 1 });
reservationSchema.index({ customerId: 1 });
reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ cafeId: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);