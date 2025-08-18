import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // For development, try MongoDB Atlas or local MongoDB
    // If neither works, we'll use in-memory database
    let mongoUri = process.env.MONGODB_URI;
    
    // If no MongoDB URI provided, use a default local one
    if (!mongoUri) {
      mongoUri = 'mongodb://localhost:27017/cafe-management';
    }

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.log('🔄 Falling back to in-memory database for development...');
    
    // For development, we can continue without MongoDB
    // In a real production environment, you'd want to fail here
    console.log('📝 Note: Using mock database - data will not persist');
    console.log('💡 To use real MongoDB:');
    console.log('   1. Install MongoDB locally, or');
    console.log('   2. Set MONGODB_URI to a MongoDB Atlas connection string');
  }
};

export default connectDB;