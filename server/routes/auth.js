import express from 'express';
import { login, register, getUser, updateUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', auth, getUser);       // New: Get current user
router.put('/me', auth, updateUser);    // New: Update current user

export default router;