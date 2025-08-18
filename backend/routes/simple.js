import express from 'express';
import { getCafes, getCafe, getCafeMenu } from '../controllers/simpleCafeController.js';
import { register, login, getMe } from '../controllers/simpleAuthController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'Mock data (development mode)'
  });
});

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getMe);

// Cafe routes
router.get('/cafes', getCafes);
router.get('/cafes/:id', getCafe);
router.get('/cafes/:id/menu', getCafeMenu);

export default router;