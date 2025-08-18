import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
import simpleRoutes from './routes/simple.js';

// For development, use simplified routes that work with or without MongoDB
app.use('/api', simpleRoutes);

// Try to import full routes if MongoDB is available
try {
  if (process.env.USE_FULL_ROUTES === 'true') {
    const authRoutes = await import('./routes/auth.js');
    const cafeRoutes = await import('./routes/cafes.js');
    const orderRoutes = await import('./routes/orders.js');
    const reservationRoutes = await import('./routes/reservations.js');
    const promotionRoutes = await import('./routes/promotions.js');
    const inventoryRoutes = await import('./routes/inventory.js');

    // Mount full routers (these will override simple routes)
    app.use('/api/auth', authRoutes.default);
    app.use('/api/cafes', cafeRoutes.default);
    app.use('/api/orders', orderRoutes.default);
    app.use('/api/reservations', reservationRoutes.default);
    app.use('/api/promotions', promotionRoutes.default);
    app.use('/api/inventory', inventoryRoutes.default);
    
    console.log('✅ Full API routes loaded');
  }
} catch (error) {
  console.log('⚠️  Using simplified API routes (some features may be limited)');
}

// Health check endpoint is handled by simple routes

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

export default app;