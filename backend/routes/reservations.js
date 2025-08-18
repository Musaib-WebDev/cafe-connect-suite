import express from 'express';
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservationStatus,
  getMyReservations,
  cancelReservation,
  checkAvailability,
  getReservationAnalytics
} from '../controllers/reservationController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateReservationCreation } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

// Routes with cafeId parameter (from parent router)
router.get('/', protect, authorize('cafeowner'), getReservations);
router.get('/analytics', protect, authorize('cafeowner'), getReservationAnalytics);

// Availability checking (public)
router.get('/availability', checkAvailability);

// Standalone reservation routes
router.post('/', optionalAuth, validateReservationCreation, createReservation);
router.get('/my', protect, authorize('customer'), getMyReservations);
router.get('/:id', protect, getReservation);
router.put('/:id/status', protect, authorize('cafeowner'), updateReservationStatus);
router.put('/:id/cancel', protect, cancelReservation);

export default router;