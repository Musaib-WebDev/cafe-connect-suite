import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n🔧 To fix this issue:');
    console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
    console.log('2. Start MongoDB service:');
    console.log('   - macOS: brew services start mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod');
    console.log('   - Windows: net start MongoDB');
    console.log('3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('4. Update MONGODB_URI in backend/.env\n');
    
    // Don't exit in development, allow server to start for API documentation
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Server starting without database connection (development mode)');
    }
  }
};

export default connectDB;