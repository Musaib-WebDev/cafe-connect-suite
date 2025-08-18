import Inventory from '../models/Inventory.js';
import Cafe from '../models/Cafe.js';

// @desc    Get all inventory items for a cafe
// @route   GET /api/inventory
// @access  Private (Cafe Owner)
export const getInventory = async (req, res) => {
  try {
    const { category, lowStock, search, page = 1, limit = 20 } = req.query;
    
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    let query = { cafeId: cafe._id, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.isLowStock = true;
    }
    
    if (search) {
      query.ingredient = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const inventory = await Inventory.find(query)
      .sort({ ingredient: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(query);

    // Get low stock count for summary
    const lowStockCount = await Inventory.countDocuments({
      cafeId: cafe._id,
      isActive: true,
      isLowStock: true
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      lowStockCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private (Cafe Owner)
export const getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(inventoryItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this inventory item'
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update inventory item
// @route   POST /api/inventory
// @access  Private (Cafe Owner)
export const createOrUpdateInventory = async (req, res) => {
  try {
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const { ingredient, currentQuantity, unit, minimumThreshold } = req.body;

    // Check if inventory item already exists
    let inventoryItem = await Inventory.findOne({
      cafeId: cafe._id,
      ingredient: ingredient
    });

    if (inventoryItem) {
      // Update existing inventory
      const oldQuantity = inventoryItem.currentQuantity;
      
      Object.assign(inventoryItem, req.body);
      
      // Add stock movement for the change
      if (oldQuantity !== currentQuantity) {
        const difference = currentQuantity - oldQuantity;
        const movementType = difference > 0 ? 'in' : 'adjustment';
        const movementQuantity = difference > 0 ? difference : currentQuantity;
        
        inventoryItem.stockMovements.push({
          type: movementType,
          quantity: movementQuantity,
          reason: difference > 0 ? 'Stock added' : 'Inventory adjustment',
          notes: req.body.notes || 'Manual update'
        });
      }

      await inventoryItem.save();
    } else {
      // Create new inventory item
      req.body.cafeId = cafe._id;
      inventoryItem = await Inventory.create(req.body);
      
      // Add initial stock movement
      inventoryItem.stockMovements.push({
        type: 'in',
        quantity: currentQuantity,
        reason: 'Initial stock',
        notes: 'Inventory item created'
      });
      
      await inventoryItem.save();
    }

    // Check for alerts
    if (inventoryItem.isLowStock) {
      await inventoryItem.createAlert(
        'low-stock',
        `${ingredient} is running low (${currentQuantity} ${unit} remaining)`
      );
    }

    if (inventoryItem.currentQuantity === 0) {
      await inventoryItem.createAlert(
        'out-of-stock',
        `${ingredient} is out of stock`
      );
    }

    res.status(inventoryItem.isNew ? 201 : 200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Create/Update inventory error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Cafe Owner)
export const updateInventoryItem = async (req, res) => {
  try {
    let inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(inventoryItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this inventory item'
      });
    }

    const oldQuantity = inventoryItem.currentQuantity;
    
    inventoryItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Add stock movement if quantity changed
    if (req.body.currentQuantity !== undefined && oldQuantity !== req.body.currentQuantity) {
      const difference = req.body.currentQuantity - oldQuantity;
      const movementType = difference > 0 ? 'in' : 'adjustment';
      const movementQuantity = difference > 0 ? difference : req.body.currentQuantity;
      
      await inventoryItem.addStockMovement(
        movementType,
        movementQuantity,
        req.body.reason || (difference > 0 ? 'Stock added' : 'Inventory adjustment'),
        null,
        req.body.notes || 'Manual update'
      );
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Cafe Owner)
export const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(inventoryItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this inventory item'
      });
    }

    // Soft delete by setting isActive to false
    inventoryItem.isActive = false;
    await inventoryItem.save();

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add stock movement
// @route   POST /api/inventory/:id/movement
// @access  Private (Cafe Owner)
export const addStockMovement = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(inventoryItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this inventory item'
      });
    }

    const { type, quantity, reason, notes } = req.body;

    await inventoryItem.addStockMovement(type, quantity, reason, null, notes);

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Add stock movement error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory alerts
// @route   GET /api/inventory/alerts
// @access  Private (Cafe Owner)
export const getInventoryAlerts = async (req, res) => {
  try {
    const { resolved } = req.query;
    
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const inventory = await Inventory.find({
      cafeId: cafe._id,
      isActive: true,
      'alerts.0': { $exists: true } // Has at least one alert
    });

    let allAlerts = [];
    
    inventory.forEach(item => {
      item.alerts.forEach(alert => {
        if (resolved === undefined || alert.isResolved === (resolved === 'true')) {
          allAlerts.push({
            ...alert.toObject(),
            inventoryId: item._id,
            ingredient: item.ingredient,
            currentQuantity: item.currentQuantity,
            unit: item.unit,
            minimumThreshold: item.minimumThreshold
          });
        }
      });
    });

    // Sort by creation date, newest first
    allAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: allAlerts.length,
      data: allAlerts
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resolve inventory alert
// @route   PUT /api/inventory/:id/alerts/:alertId/resolve
// @access  Private (Cafe Owner)
export const resolveInventoryAlert = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(inventoryItem.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this inventory item'
      });
    }

    const alert = inventoryItem.alerts.id(req.params.alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    
    await inventoryItem.save();

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Resolve inventory alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get inventory analytics
// @route   GET /api/inventory/analytics
// @access  Private (Cafe Owner)
export const getInventoryAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const inventory = await Inventory.find({
      cafeId: cafe._id,
      isActive: true
    });

    const analytics = {
      totalItems: inventory.length,
      lowStockItems: inventory.filter(item => item.isLowStock).length,
      outOfStockItems: inventory.filter(item => item.currentQuantity === 0).length,
      categoryBreakdown: {},
      totalValue: 0,
      recentMovements: 0,
      topConsumedItems: []
    };

    // Category breakdown and total value
    inventory.forEach(item => {
      analytics.categoryBreakdown[item.category] = (analytics.categoryBreakdown[item.category] || 0) + 1;
      
      if (item.costPerUnit) {
        analytics.totalValue += item.currentQuantity * item.costPerUnit;
      }
    });

    // Recent movements count
    inventory.forEach(item => {
      const recentMovements = item.stockMovements.filter(
        movement => movement.timestamp >= startDate
      );
      analytics.recentMovements += recentMovements.length;
    });

    // Top consumed items (most stock movements out)
    const consumptionData = inventory.map(item => {
      const outMovements = item.stockMovements.filter(
        movement => movement.type === 'out' && movement.timestamp >= startDate
      );
      const totalConsumed = outMovements.reduce((sum, movement) => sum + movement.quantity, 0);
      
      return {
        ingredient: item.ingredient,
        totalConsumed,
        unit: item.unit,
        currentQuantity: item.currentQuantity
      };
    }).filter(item => item.totalConsumed > 0)
      .sort((a, b) => b.totalConsumed - a.totalConsumed)
      .slice(0, 10);

    analytics.topConsumedItems = consumptionData;

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update inventory
// @route   PUT /api/inventory/bulk
// @access  Private (Cafe Owner)
export const bulkUpdateInventory = async (req, res) => {
  try {
    const { items } = req.body;
    
    // Get cafe owned by user
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const updatePromises = items.map(async (item) => {
      const inventoryItem = await Inventory.findOne({
        _id: item.id,
        cafeId: cafe._id
      });

      if (inventoryItem) {
        const oldQuantity = inventoryItem.currentQuantity;
        
        Object.assign(inventoryItem, item.updates);
        
        // Add stock movement if quantity changed
        if (item.updates.currentQuantity !== undefined && oldQuantity !== item.updates.currentQuantity) {
          const difference = item.updates.currentQuantity - oldQuantity;
          const movementType = difference > 0 ? 'in' : 'adjustment';
          const movementQuantity = difference > 0 ? difference : item.updates.currentQuantity;
          
          inventoryItem.stockMovements.push({
            type: movementType,
            quantity: movementQuantity,
            reason: 'Bulk update',
            notes: item.notes || 'Bulk inventory update'
          });
        }

        await inventoryItem.save();
        return inventoryItem;
      }
      return null;
    });

    const updatedItems = await Promise.all(updatePromises);
    const validItems = updatedItems.filter(item => item !== null);

    res.status(200).json({
      success: true,
      count: validItems.length,
      data: validItems
    });
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};