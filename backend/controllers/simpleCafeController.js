import { mockDB } from '../config/mockData.js';
import mongoose from 'mongoose';

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc    Get all cafes
// @route   GET /api/cafes
// @access  Public
export const getCafes = async (req, res) => {
  try {
    let cafes;
    
    if (isMongoConnected()) {
      // Use MongoDB if available
      const Cafe = mongoose.model('Cafe');
      cafes = await Cafe.find({ isActive: true }).populate('ownerId', 'name email');
    } else {
      // Use mock data
      cafes = mockDB.find('cafes');
    }

    res.status(200).json({
      success: true,
      count: cafes.length,
      data: cafes
    });
  } catch (error) {
    console.error('Error in getCafes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single cafe
// @route   GET /api/cafes/:id
// @access  Public
export const getCafe = async (req, res) => {
  try {
    let cafe;
    
    if (isMongoConnected()) {
      const Cafe = mongoose.model('Cafe');
      cafe = await Cafe.findById(req.params.id).populate('ownerId', 'name email');
    } else {
      cafe = mockDB.findById('cafes', req.params.id);
    }

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Error in getCafe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get cafe menu
// @route   GET /api/cafes/:id/menu
// @access  Public
export const getCafeMenu = async (req, res) => {
  try {
    let menuItems;
    
    if (isMongoConnected()) {
      const Menu = mongoose.model('Menu');
      menuItems = await Menu.find({ cafe: req.params.id, available: true });
    } else {
      const allMenuItems = mockDB.find('menuItems');
      menuItems = allMenuItems.filter(item => item.cafe === req.params.id && item.available);
    }

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Error in getCafeMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};