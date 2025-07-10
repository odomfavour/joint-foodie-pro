import express from 'express';

import { authorize, protectRoute } from '../middleware/auth.middleware.js';
import {
  createBranch,
  deleteBranch,
  getBranches,
  getNearbyBranches,
  getSingleBranch,
  getUsersByBranch,
  updateBranch,
} from '../controllers/branch.controller.js';

const router = express.Router();

router.get('/branches/nearby', getNearbyBranches);
router.post('/branches', protectRoute, authorize('superadmin'), createBranch);
router.get(
  '/branches/:id',
  protectRoute,
  authorize('admin', 'superadmin'),
  getSingleBranch
);
router.get('/branches', protectRoute, authorize('superadmin'), getBranches);
router.put(
  '/branches/:id',
  protectRoute,
  authorize('superadmin'),
  updateBranch
);
router.delete(
  '/branches:id',
  protectRoute,
  authorize('superadmin'),
  deleteBranch
);
router.get(
  '/branches/:id/users',
  protectRoute,
  authorize('superadmin', 'admin'),
  getUsersByBranch
);

export default router;
