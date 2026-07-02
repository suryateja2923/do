import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const ctrl = new AdminController();

// All admin routes require ADMIN role
router.use(requireAuth, requireRole([UserRole.ADMIN]));

router.get('/dashboard-stats', ctrl.getDashboardStats);

router.get('/owners', ctrl.getOwners);
router.post('/owners/:id/verify', ctrl.verifyOwner);

router.get('/properties', ctrl.getProperties);
router.post('/properties/:id/verify', ctrl.verifyProperty);

router.get('/bookings', ctrl.getBookings);
router.get('/complaints', ctrl.getComplaints);
router.get('/managers', ctrl.getManagers);
router.get('/users', ctrl.getUsers);
router.get('/payments', ctrl.getPayments);

export default router;
