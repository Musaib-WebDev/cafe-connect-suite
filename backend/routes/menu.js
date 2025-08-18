import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuCategories,
  updateMenuItemAvailability,
  bulkUpdateMenuItems,
  getPopularMenuItems
} from '../controllers/menuController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateMenuCreation } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', optionalAuth, getMenuItems);
router.get('/categories', getMenuCategories);
router.get('/popular', getPopularMenuItems);
router.get('/:id', getMenuItem);

// Protected routes (Cafe Owner)
router.post('/', protect, authorize('cafeowner'), validateMenuCreation, createMenuItem);
router.put('/bulk', protect, authorize('cafeowner'), bulkUpdateMenuItems);
router.put('/:id', protect, authorize('cafeowner'), updateMenuItem);
router.put('/:id/availability', protect, authorize('cafeowner'), updateMenuItemAvailability);
router.delete('/:id', protect, authorize('cafeowner'), deleteMenuItem);

export default router;