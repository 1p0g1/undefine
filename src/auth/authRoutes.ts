import { Router } from 'express';
import { login, register } from './authController.js';
import { authenticateUser } from './authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

export { router as authRouter }; 