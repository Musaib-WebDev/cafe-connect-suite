import express from 'express';
import {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
  getPromotionStats,
  deactivatePromotion,
  getMyPromotions
} from '../controllers/promotionController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validatePromotionCreation } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

// Routes with cafeId parameter (from parent router)
router.get('/', optionalAuth, getPromotions);

// Public validation route
router.post('/validate', validatePromotion);

// Protected routes
router.post('/', protect, authorize('cafeowner'), validatePromotionCreation, createPromotion);
router.get('/my', protect, authorize('cafeowner'), getMyPromotions);
router.get('/:id', optionalAuth, getPromotion);
router.get('/:id/stats', protect, authorize('cafeowner'), getPromotionStats);
router.put('/:id', protect, authorize('cafeowner'), updatePromotion);
router.put('/:id/deactivate', protect, authorize('cafeowner'), deactivatePromotion);
router.delete('/:id', protect, authorize('cafeowner'), deletePromotion);

export default router;