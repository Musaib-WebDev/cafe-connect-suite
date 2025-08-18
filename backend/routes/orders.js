import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  rateOrder
} from '../controllers/orderController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateOrderCreation } from '../middleware/validation.js';
import { orderLimiter } from '../middleware/rateLimiter.js';

const router = express.Router({ mergeParams: true });

// Routes with cafeId parameter (from parent router)
router.get('/', protect, authorize('cafeowner'), getOrders);

// Standalone order routes
router.post('/', orderLimiter, optionalAuth, validateOrderCreation, createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('cafeowner'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/rating', protect, authorize('customer'), rateOrder);

export default router;