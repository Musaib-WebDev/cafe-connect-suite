import mongoose from 'mongoose';
import { mockDB } from '../config/mockData.js';

// Check if MongoDB is connected
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Middleware to handle database fallback
export const withDbFallback = (controller) => {
  return async (req, res, next) => {
    // Add database helper to request object
    req.db = {
      isMongoConnected: isMongoConnected(),
      mockDB: mockDB
    };
    
    try {
      await controller(req, res, next);
    } catch (error) {
      // If it's a MongoDB connection error and we have mock data available
      if (!isMongoConnected() && error.name === 'MongooseError') {
        console.log('🔄 Falling back to mock data due to MongoDB unavailability');
        // You can add specific fallback logic here
      }
      next(error);
    }
  };
};

// Helper function to create a simple response structure similar to Mongoose
export const createMockResponse = (data, isArray = false) => {
  if (isArray) {
    return {
      docs: data,
      totalDocs: data.length,
      limit: 10,
      page: 1,
      totalPages: Math.ceil(data.length / 10),
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null
    };
  }
  return data;
};