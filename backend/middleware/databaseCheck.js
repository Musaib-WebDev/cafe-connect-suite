import mongoose from 'mongoose';

export const checkDatabaseConnection = (req, res, next) => {
  // Skip database check for health endpoint
  if (req.path === '/api/health') {
    return next();
  }

  // Check if mongoose is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please check your MongoDB connection.',
      error: 'DATABASE_DISCONNECTED'
    });
  }

  next();
};