import Promotion from '../models/Promotion.js';
import Cafe from '../models/Cafe.js';

// @desc    Get all promotions for a cafe
// @route   GET /api/cafes/:cafeId/promotions
// @access  Public
export const getPromotions = async (req, res) => {
  try {
    const { isActive, isPublic } = req.query;
    
    let query = { cafeId: req.params.cafeId };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Only show public promotions to non-owners
    if (req.user?.role !== 'cafeowner' && req.user?.role !== 'admin') {
      query.isPublic = true;
      query.isActive = true;
      query.validFrom = { $lte: new Date() };
      query.validUntil = { $gte: new Date() };
    }

    const promotions = await Promotion.find(query)
      .populate('applicableItems', 'name price category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Public
export const getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('cafeId', 'name')
      .populate('applicableItems', 'name price category');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user can view this promotion
    if (!promotion.isPublic && req.user?.role !== 'cafeowner' && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this promotion'
      });
    }

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private (Cafe Owner)
export const createPromotion = async (req, res) => {
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

    // Validate dates
    const validFrom = new Date(req.body.validFrom);
    const validUntil = new Date(req.body.validUntil);

    if (validFrom >= validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Valid from date must be before valid until date'
      });
    }

    if (validUntil < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date cannot be in the past'
      });
    }

    // Check if promotion code already exists for this cafe
    const existingPromotion = await Promotion.findOne({
      cafeId: cafe._id,
      code: req.body.code.toUpperCase()
    });

    if (existingPromotion) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code already exists for this cafe'
      });
    }

    // Convert code to uppercase
    req.body.code = req.body.code.toUpperCase();

    const promotion = await Promotion.create(req.body);

    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('applicableItems', 'name price category');

    res.status(201).json({
      success: true,
      data: populatedPromotion
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private (Cafe Owner)
export const updatePromotion = async (req, res) => {
  try {
    let promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(promotion.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this promotion'
      });
    }

    // Validate dates if provided
    if (req.body.validFrom && req.body.validUntil) {
      const validFrom = new Date(req.body.validFrom);
      const validUntil = new Date(req.body.validUntil);

      if (validFrom >= validUntil) {
        return res.status(400).json({
          success: false,
          message: 'Valid from date must be before valid until date'
        });
      }
    }

    // Convert code to uppercase if provided
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
      
      // Check if new code conflicts with existing promotions
      const existingPromotion = await Promotion.findOne({
        cafeId: promotion.cafeId,
        code: req.body.code,
        _id: { $ne: promotion._id }
      });

      if (existingPromotion) {
        return res.status(400).json({
          success: false,
          message: 'Promotion code already exists for this cafe'
        });
      }
    }

    promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('applicableItems', 'name price category');

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private (Cafe Owner)
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(promotion.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this promotion'
      });
    }

    await promotion.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Public
export const validatePromotion = async (req, res) => {
  try {
    const { code, cafeId, orderTotal, customerId } = req.body;

    if (!code || !cafeId) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code and cafe ID are required'
      });
    }

    const promotion = await Promotion.findOne({
      cafeId,
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).populate('applicableItems', 'name price category');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promotion code'
      });
    }

    // Check if promotion is currently valid
    if (!promotion.isCurrentlyValid()) {
      return res.status(400).json({
        success: false,
        message: 'Promotion is no longer valid'
      });
    }

    // Check minimum order amount
    if (promotion.minimumOrderAmount && orderTotal < promotion.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${promotion.minimumOrderAmount} required`
      });
    }

    // Check customer usage limit
    if (customerId && promotion.usageLimit.perCustomer) {
      const customerUsage = promotion.usageCount.byCustomer.find(
        u => u.customerId.toString() === customerId
      );
      
      if (customerUsage && customerUsage.count >= promotion.usageLimit.perCustomer) {
        return res.status(400).json({
          success: false,
          message: 'You have reached the usage limit for this promotion'
        });
      }
    }

    // Check day of week restrictions
    if (promotion.dayOfWeekRestrictions && promotion.dayOfWeekRestrictions.length > 0) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      if (!promotion.dayOfWeekRestrictions.includes(today)) {
        return res.status(400).json({
          success: false,
          message: 'Promotion is not valid on this day of the week'
        });
      }
    }

    // Check time restrictions
    if (promotion.timeRestrictions.startTime && promotion.timeRestrictions.endTime) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime < promotion.timeRestrictions.startTime || currentTime > promotion.timeRestrictions.endTime) {
        return res.status(400).json({
          success: false,
          message: `Promotion is only valid between ${promotion.timeRestrictions.startTime} and ${promotion.timeRestrictions.endTime}`
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (promotion.type === 'percentage') {
      discountAmount = (orderTotal * promotion.discountValue) / 100;
      if (promotion.maximumDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maximumDiscountAmount);
      }
    } else if (promotion.type === 'fixed-amount') {
      discountAmount = Math.min(promotion.discountValue, orderTotal);
    }

    res.status(200).json({
      success: true,
      data: {
        promotion: {
          id: promotion._id,
          name: promotion.name,
          code: promotion.code,
          type: promotion.type,
          discountValue: promotion.discountValue,
          description: promotion.description
        },
        discountAmount,
        finalTotal: Math.max(0, orderTotal - discountAmount)
      }
    });
  } catch (error) {
    console.error('Validate promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get promotion usage statistics
// @route   GET /api/promotions/:id/stats
// @access  Private (Cafe Owner)
export const getPromotionStats = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(promotion.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view promotion statistics'
      });
    }

    const stats = {
      totalUsage: promotion.usageCount.total,
      uniqueCustomers: promotion.usageCount.byCustomer.length,
      usageLimit: promotion.usageLimit.total,
      remainingUses: promotion.usageLimit.total ? promotion.usageLimit.total - promotion.usageCount.total : null,
      isActive: promotion.isActive,
      isCurrentlyValid: promotion.isCurrentlyValid(),
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil,
      daysRemaining: Math.ceil((promotion.validUntil - new Date()) / (1000 * 60 * 60 * 24))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get promotion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Deactivate promotion
// @route   PUT /api/promotions/:id/deactivate
// @access  Private (Cafe Owner)
export const deactivatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(promotion.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to deactivate this promotion'
      });
    }

    promotion.isActive = false;
    await promotion.save();

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Deactivate promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get my promotions (for cafe owner)
// @route   GET /api/promotions/my
// @access  Private (Cafe Owner)
export const getMyPromotions = async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ ownerId: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    const promotions = await Promotion.find({ cafeId: cafe._id })
      .populate('applicableItems', 'name price category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    console.error('Get my promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};