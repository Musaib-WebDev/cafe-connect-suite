import express from 'express';
import {
  getCafeAnalytics,
  getSuperAdminAnalytics,
  getProfitMarginAnalysis
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Cafe analytics routes (with cafeId from parent router)
router.get('/', protect, authorize('cafeowner'), getCafeAnalytics);
router.get('/profit-margin', protect, authorize('cafeowner'), getProfitMarginAnalysis);

// Super admin analytics routes
router.get('/admin/platform', protect, authorize('admin', 'super_admin'), getSuperAdminAnalytics);

export default router;