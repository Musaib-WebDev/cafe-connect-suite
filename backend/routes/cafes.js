import express from 'express';
import {
  getCafes,
  getCafe,
  createCafe,
  updateCafe,
  deleteCafe,
  getMyCafe,
  addTable,
  updateTable,
  deleteTable
} from '../controllers/cafeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCafeCreation } from '../middleware/validation.js';

// Import other route files
import menuRoutes from './menu.js';
import orderRoutes from './orders.js';
import reservationRoutes from './reservations.js';
import promotionRoutes from './promotions.js';
import analyticsRoutes from './analytics.js';
import qrcodeRoutes from './qrcodes.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:cafeId/menu', menuRoutes);
router.use('/:cafeId/orders', orderRoutes);
router.use('/:cafeId/reservations', reservationRoutes);
router.use('/:cafeId/promotions', promotionRoutes);
router.use('/:cafeId/analytics', analyticsRoutes);
router.use('/:cafeId/qr-codes', qrcodeRoutes);

// Cafe routes
router.route('/')
  .get(getCafes)
  .post(protect, authorize('cafeowner'), validateCafeCreation, createCafe);

router.route('/owner/me')
  .get(protect, authorize('cafeowner'), getMyCafe);

router.route('/:id')
  .get(getCafe)
  .put(protect, authorize('cafeowner'), updateCafe)
  .delete(protect, authorize('cafeowner'), deleteCafe);

// Table management routes
router.route('/:id/tables')
  .post(protect, authorize('cafeowner'), addTable);

router.route('/:id/tables/:tableId')
  .put(protect, authorize('cafeowner'), updateTable)
  .delete(protect, authorize('cafeowner'), deleteTable);

export default router;