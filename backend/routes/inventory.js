import express from 'express';
import {
  getInventory,
  getInventoryItem,
  createOrUpdateInventory,
  updateInventoryItem,
  deleteInventoryItem,
  addStockMovement,
  getInventoryAlerts,
  resolveInventoryAlert,
  getInventoryAnalytics,
  bulkUpdateInventory
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateInventoryUpdate } from '../middleware/validation.js';

const router = express.Router();

// All inventory routes require cafe owner authentication
router.use(protect, authorize('cafeowner'));

router.route('/')
  .get(getInventory)
  .post(validateInventoryUpdate, createOrUpdateInventory);

router.get('/alerts', getInventoryAlerts);
router.get('/analytics', getInventoryAnalytics);
router.put('/bulk', bulkUpdateInventory);

router.route('/:id')
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

router.post('/:id/movement', addStockMovement);
router.put('/:id/alerts/:alertId/resolve', resolveInventoryAlert);

export default router;