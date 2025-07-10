import express from 'express';

import { authorize, protectRoute } from '../middleware/auth.middleware.js';
import {
  assignBranch,
  deleteUser,
  getSingleUser,
  getUsers,
  removeBranch,
  toggleUserStatus,
  updateUserRole,
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/users', protectRoute, authorize('admin', 'superadmin'), getUsers);
router.get(
  '/users/:id',
  protectRoute,
  authorize('admin', 'superadmin'),
  getSingleUser
);
router.delete('/users/:id', protectRoute, authorize('superadmin'), deleteUser);
router.patch(
  '/users/:id/role',
  protectRoute,
  authorize('admin', 'superadmin'),
  updateUserRole
);
router.patch(
  '/users/:id/assign-branch',
  protectRoute,
  authorize('admin', 'superadmin'),
  assignBranch
);
router.patch(
  '/users/:id/remove-branch',
  protectRoute,
  authorize('admin', 'superadmin'),
  removeBranch
);
router.patch(
  '/users/:id/toggle-status',
  protectRoute,
  authorize('admin', 'superadmin'),
  toggleUserStatus
);
export default router;
