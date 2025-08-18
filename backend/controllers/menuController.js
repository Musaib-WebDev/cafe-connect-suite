import Menu from '../models/Menu.js';
import Cafe from '../models/Cafe.js';

// @desc    Get all menu items for a cafe
// @route   GET /api/cafes/:cafeId/menu
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const { category, available, popular, search } = req.query;
    
    let query = { cafeId: req.params.cafeId };
    
    if (category) {
      query.category = category;
    }
    
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }
    
    if (popular !== undefined) {
      query.isPopular = popular === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const menuItems = await Menu.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Cafe Owner)
export const createMenuItem = async (req, res) => {
  try {
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    req.body.cafeId = cafe._id;

    const menuItem = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Cafe Owner)
export const updateMenuItem = async (req, res) => {
  try {
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(menuItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Cafe Owner)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(menuItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get menu categories for a cafe
// @route   GET /api/cafes/:cafeId/menu/categories
// @access  Public
export const getMenuCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct('category', { 
      cafeId: req.params.cafeId,
      isAvailable: true 
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update menu item availability
// @route   PUT /api/menu/:id/availability
// @access  Private (Cafe Owner)
export const updateMenuItemAvailability = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(menuItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    menuItem.isAvailable = req.body.isAvailable;
    await menuItem.save();

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item availability error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk update menu items
// @route   PUT /api/menu/bulk
// @access  Private (Cafe Owner)
export const bulkUpdateMenuItems = async (req, res) => {
  try {
    const { items } = req.body;
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const updatePromises = items.map(item => 
      Menu.findOneAndUpdate(
        { _id: item.id, cafeId: cafe._id },
        item.updates,
        { new: true, runValidators: true }
      )
    );

    const updatedItems = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      data: updatedItems
    });
  } catch (error) {
    console.error('Bulk update menu items error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get popular menu items
// @route   GET /api/cafes/:cafeId/menu/popular
// @access  Public
export const getPopularMenuItems = async (req, res) => {
  try {
    const popularItems = await Menu.find({
      cafeId: req.params.cafeId,
      isAvailable: true,
      isPopular: true
    })
    .sort({ orderCount: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      count: popularItems.length,
      data: popularItems
    });
  } catch (error) {
    console.error('Get popular menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};