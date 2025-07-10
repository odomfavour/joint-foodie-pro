import express from 'express';
import {
  getProfile,
  login,
  register,
  updatePassword,
  updateProfile,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protectRoute, updateProfile);
router.get('/profile', protectRoute, getProfile);
router.put('/password', protectRoute, updatePassword);
// router.post('/logout', logout);
// router.put('/update-profile', protectRoute, updateProfile);
// router.get('/check', protectRoute, checkAuth);
export default router;
