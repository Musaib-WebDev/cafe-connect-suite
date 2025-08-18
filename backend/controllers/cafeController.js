import Cafe from '../models/Cafe.js';
import User from '../models/User.js';

// @desc    Get all cafes
// @route   GET /api/cafes
// @access  Public
export const getCafes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      cuisine,
      rating,
      search,
      lat,
      lng,
      radius = 10
    } = req.query;

    let query = { isActive: true };
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by city
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    // Filter by rating
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    let cafesQuery = Cafe.find(query).populate('ownerId', 'name email');

    // Location-based search
    if (lat && lng) {
      cafesQuery = Cafe.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      }).populate('ownerId', 'name email');
    }

    // Pagination
    const skip = (page - 1) * limit;
    cafesQuery = cafesQuery.skip(skip).limit(parseInt(limit));

    const cafes = await cafesQuery;
    const total = await Cafe.countDocuments(query);

    res.status(200).json({
      success: true,
      count: cafes.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: cafes
    });
  } catch (error) {
    console.error('Get cafes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single cafe
// @route   GET /api/cafes/:id
// @access  Public
export const getCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id).populate('ownerId', 'name email');

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
    console.error('Get cafe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new cafe
// @route   POST /api/cafes
// @access  Private (Cafe Owner)
export const createCafe = async (req, res) => {
  try {
    // Add user to req.body
    req.body.ownerId = req.user.id;

    // Check if user already owns a cafe (basic plan restriction)
    const existingCafe = await Cafe.findOne({ ownerId: req.user.id });
    if (existingCafe) {
      return res.status(400).json({
        success: false,
        message: 'You already own a cafe. Upgrade to premium to own multiple cafes.'
      });
    }

    const cafe = await Cafe.create(req.body);

    res.status(201).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Create cafe error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update cafe
// @route   PUT /api/cafes/:id
// @access  Private (Cafe Owner)
export const updateCafe = async (req, res) => {
  try {
    let cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Make sure user is cafe owner
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this cafe'
      });
    }

    cafe = await Cafe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Update cafe error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete cafe
// @route   DELETE /api/cafes/:id
// @access  Private (Cafe Owner)
export const deleteCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Make sure user is cafe owner
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this cafe'
      });
    }

    await cafe.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Cafe deleted successfully'
    });
  } catch (error) {
    console.error('Delete cafe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get cafe by owner
// @route   GET /api/cafes/owner/me
// @access  Private (Cafe Owner)
export const getMyCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ ownerId: req.user.id });

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'No cafe found for this owner'
      });
    }

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Get my cafe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add table to cafe
// @route   POST /api/cafes/:id/tables
// @access  Private (Cafe Owner)
export const addTable = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Make sure user is cafe owner
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this cafe'
      });
    }

    // Check if table number already exists
    const existingTable = cafe.tables.find(table => table.number === req.body.number);
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }

    cafe.tables.push(req.body);
    await cafe.save();

    res.status(201).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Add table error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update table
// @route   PUT /api/cafes/:id/tables/:tableId
// @access  Private (Cafe Owner)
export const updateTable = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Make sure user is cafe owner
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this cafe'
      });
    }

    const table = cafe.tables.id(req.params.tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    Object.assign(table, req.body);
    await cafe.save();

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete table
// @route   DELETE /api/cafes/:id/tables/:tableId
// @access  Private (Cafe Owner)
export const deleteTable = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Make sure user is cafe owner
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this cafe'
      });
    }

    cafe.tables.id(req.params.tableId).remove();
    await cafe.save();

    res.status(200).json({
      success: true,
      data: cafe
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};