import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { checkDatabaseConnection } from './middleware/databaseCheck.js';

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

// Database connection check (except for health endpoint)
app.use(checkDatabaseConnection);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRoutes from './routes/auth.js';
import cafeRoutes from './routes/cafes.js';
import orderRoutes from './routes/orders.js';
import reservationRoutes from './routes/reservations.js';
import promotionRoutes from './routes/promotions.js';
import inventoryRoutes from './routes/inventory.js';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const dbMessage = mongoose.connection.readyState === 1 ? 
    `Connected to ${mongoose.connection.host}` : 
    'Database not connected';

  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus,
      message: dbMessage
    },
    version: '1.0.0'
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Please try one of these solutions:`);
    console.log(`1. Kill the process using port ${PORT}`);
    console.log(`2. Change the PORT in backend/.env to a different port (e.g., 5002)`);
    console.log(`3. Wait a moment and try again`);
    process.exit(1);
  } else {
    console.log(`❌ Server error: ${error.message}`);
    process.exit(1);
  }
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