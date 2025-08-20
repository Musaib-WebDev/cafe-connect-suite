import express from 'express';
import {
  generateTableQRCode,
  getCafeQRCodes,
  generateBulkQRCodes,
  downloadQRCode
} from '../controllers/qrcodeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// QR code routes (with cafeId from parent router)
router.route('/')
  .get(protect, authorize('cafeowner'), getCafeQRCodes)
  .post(protect, authorize('cafeowner'), generateTableQRCode);

router.post('/bulk', protect, authorize('cafeowner'), generateBulkQRCodes);
router.get('/:tableId/download', protect, authorize('cafeowner'), downloadQRCode);

export default router;