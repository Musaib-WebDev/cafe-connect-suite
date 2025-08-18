import Reservation from '../models/Reservation.js';
import Cafe from '../models/Cafe.js';

// @desc    Get all reservations for a cafe
// @route   GET /api/cafes/:cafeId/reservations
// @access  Private (Cafe Owner)
export const getReservations = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { cafeId: req.params.cafeId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.reservationDate = { $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;
    
    const reservations = await Reservation.find(query)
      .populate('customerId', 'name email phone')
      .sort({ reservationDate: 1, reservationTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: reservations
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('cafeId', 'name address contact');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && reservation.customerId?.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this reservation'
      });
    }

    if (req.user.role === 'cafeowner') {
      const cafe = await Cafe.findById(reservation.cafeId);
      if (cafe.ownerId.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to view this reservation'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
export const createReservation = async (req, res) => {
  try {
    const {
      cafeId,
      customerInfo,
      tableNumber,
      partySize,
      reservationDate,
      reservationTime,
      duration = 120,
      specialRequests,
      occasion,
      seatingPreference
    } = req.body;

    // Validate cafe exists and allows reservations
    const cafe = await Cafe.findById(cafeId);
    if (!cafe || !cafe.isActive || !cafe.settings.allowReservations) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found or reservations not allowed'
      });
    }

    // Check if reservation date is in the future
    const resDate = new Date(reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (resDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Reservation date cannot be in the past'
      });
    }

    // Check table availability if table number is specified
    if (tableNumber) {
      const table = cafe.tables.find(t => t.number === tableNumber);
      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      if (table.capacity < partySize) {
        return res.status(400).json({
          success: false,
          message: 'Table capacity is insufficient for party size'
        });
      }

      // Check for conflicting reservations
      const [hour, minute] = reservationTime.split(':').map(Number);
      const startTime = new Date(resDate);
      startTime.setHours(hour, minute, 0, 0);
      
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const conflictingReservations = await Reservation.find({
        cafeId,
        tableNumber,
        reservationDate: resDate,
        status: { $in: ['pending', 'confirmed', 'seated'] },
        $or: [
          {
            // Existing reservation starts before new one ends and ends after new one starts
            $and: [
              { reservationTime: { $lt: reservationTime } },
              // Add duration check here for more accurate conflict detection
            ]
          }
        ]
      });

      if (conflictingReservations.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Table is not available at the requested time'
        });
      }
    } else {
      // Find available table for the party size
      const availableTables = cafe.tables.filter(table => 
        table.capacity >= partySize && table.isAvailable
      );

      if (availableTables.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No tables available for the requested party size'
        });
      }

      // For now, assign the first available table
      // In a more sophisticated system, you'd check for actual availability at the time
      req.body.tableNumber = availableTables[0].number;
    }

    const reservationData = {
      cafeId,
      customerId: req.user?.id,
      customerInfo,
      tableNumber: req.body.tableNumber,
      partySize,
      reservationDate: resDate,
      reservationTime,
      duration,
      specialRequests,
      occasion,
      seatingPreference
    };

    const reservation = await Reservation.create(reservationData);

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('cafeId', 'name address contact');

    res.status(201).json({
      success: true,
      data: populatedReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private (Cafe Owner)
export const updateReservationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(reservation.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this reservation'
      });
    }

    // Update status history
    reservation.statusHistory.push({
      status: reservation.status,
      timestamp: new Date(),
      note: note || `Status changed from ${reservation.status} to ${status}`
    });

    reservation.status = status;

    // Update timestamps based on status
    if (status === 'seated') {
      reservation.checkedInAt = new Date();
    } else if (status === 'completed') {
      reservation.completedAt = new Date();
    }

    await reservation.save();

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer reservations
// @route   GET /api/reservations/my
// @access  Private (Customer)
export const getMyReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, upcoming } = req.query;
    
    let query = { customerId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.reservationDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;
    
    const reservations = await Reservation.find(query)
      .populate('cafeId', 'name address contact images')
      .sort({ reservationDate: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: reservations
    });
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check authorization
    let authorized = false;
    if (req.user.role === 'customer' && reservation.customerId?.toString() === req.user.id) {
      authorized = true;
    } else if (req.user.role === 'cafeowner') {
      const cafe = await Cafe.findById(reservation.cafeId);
      if (cafe.ownerId.toString() === req.user.id) {
        authorized = true;
      }
    } else if (req.user.role === 'admin') {
      authorized = true;
    }

    if (!authorized) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Check if reservation can be cancelled
    if (['completed', 'cancelled', 'no-show'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Reservation cannot be cancelled at this stage'
      });
    }

    reservation.status = 'cancelled';
    reservation.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Reservation cancelled'
    });

    await reservation.save();

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check table availability
// @route   GET /api/cafes/:cafeId/availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { date, time, duration = 120, partySize } = req.query;
    
    const cafe = await Cafe.findById(req.params.cafeId);
    if (!cafe || !cafe.isActive || !cafe.settings.allowReservations) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found or reservations not allowed'
      });
    }

    // Get tables that can accommodate the party size
    const suitableTables = cafe.tables.filter(table => 
      table.capacity >= partySize && table.isAvailable
    );

    if (suitableTables.length === 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'No tables available for the requested party size',
        availableTables: []
      });
    }

    // Check for existing reservations on the requested date and time
    const resDate = new Date(date);
    const [hour, minute] = time.split(':').map(Number);
    const requestedStartTime = new Date(resDate);
    requestedStartTime.setHours(hour, minute, 0, 0);
    
    const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

    const existingReservations = await Reservation.find({
      cafeId: req.params.cafeId,
      reservationDate: resDate,
      status: { $in: ['pending', 'confirmed', 'seated'] }
    });

    // Filter out tables that are already reserved
    const availableTables = suitableTables.filter(table => {
      const tableReservations = existingReservations.filter(res => res.tableNumber === table.number);
      
      return !tableReservations.some(res => {
        const [resHour, resMinute] = res.reservationTime.split(':').map(Number);
        const resStartTime = new Date(resDate);
        resStartTime.setHours(resHour, resMinute, 0, 0);
        const resEndTime = new Date(resStartTime.getTime() + res.duration * 60000);

        // Check for time overlap
        return (requestedStartTime < resEndTime && requestedEndTime > resStartTime);
      });
    });

    res.status(200).json({
      success: true,
      available: availableTables.length > 0,
      availableTables: availableTables.map(table => ({
        number: table.number,
        capacity: table.capacity
      })),
      totalSuitableTables: suitableTables.length,
      availableCount: availableTables.length
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get reservation analytics for cafe owner
// @route   GET /api/cafes/:cafeId/reservations/analytics
// @access  Private (Cafe Owner)
export const getReservationAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Check if user owns the cafe
    const cafe = await Cafe.findById(req.params.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view analytics for this cafe'
      });
    }

    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reservations = await Reservation.find({
      cafeId: req.params.cafeId,
      createdAt: { $gte: startDate }
    });

    const analytics = {
      totalReservations: reservations.length,
      statusBreakdown: {},
      averagePartySize: 0,
      popularTimes: {},
      noShowRate: 0,
      cancellationRate: 0
    };

    // Status breakdown
    reservations.forEach(res => {
      analytics.statusBreakdown[res.status] = (analytics.statusBreakdown[res.status] || 0) + 1;
    });

    // Average party size
    if (reservations.length > 0) {
      analytics.averagePartySize = Math.round(
        reservations.reduce((sum, res) => sum + res.partySize, 0) / reservations.length * 10
      ) / 10;
    }

    // Popular times (group by hour)
    reservations.forEach(res => {
      const hour = res.reservationTime.split(':')[0];
      analytics.popularTimes[hour] = (analytics.popularTimes[hour] || 0) + 1;
    });

    // No-show and cancellation rates
    const noShows = analytics.statusBreakdown['no-show'] || 0;
    const cancelled = analytics.statusBreakdown['cancelled'] || 0;
    
    analytics.noShowRate = reservations.length > 0 ? Math.round((noShows / reservations.length) * 100) : 0;
    analytics.cancellationRate = reservations.length > 0 ? Math.round((cancelled / reservations.length) * 100) : 0;

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get reservation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};