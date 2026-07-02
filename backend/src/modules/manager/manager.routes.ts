import { Router } from 'express';
import { ManagerController } from './manager.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const ctrl = new ManagerController();

// Protect all manager routes
router.use(requireAuth, requireRole([UserRole.MANAGER, UserRole.ADMIN]));

router.get('/dashboard-stats', ctrl.getDashboardStats);
router.get('/owners', ctrl.getOwners);
router.post('/owners/:id/verify', ctrl.verifyOwner);
router.post('/owners/:id/request-docs', ctrl.requestOwnerDocuments);
router.post('/owners/:id/suspend', ctrl.suspendOwner);
router.get('/verification-history/:id', ctrl.getVerificationHistory);

router.get('/properties', ctrl.getProperties);
router.post('/properties/:id/verify', ctrl.verifyProperty);
router.post('/properties/:id/request-corrections', ctrl.requestPropertyCorrections);
router.post('/properties/:id/suspend', ctrl.suspendProperty);

router.get('/bookings', ctrl.getBookings);
router.post('/bookings/:id/verify', ctrl.verifyBooking);

router.get('/complaints', ctrl.getComplaints);
router.post('/complaints/:id/assign', ctrl.assignComplaint);
router.post('/complaints/:id/status', ctrl.updateComplaintStatus);

router.get('/tasks', ctrl.getTasks);
router.post('/tasks/:id/status', ctrl.updateTaskStatus);

router.post('/notifications/send', ctrl.sendNotification);
router.post('/notifications/broadcast', ctrl.broadcastAnnouncement);

router.get('/reports', ctrl.getReports);
router.get('/search', ctrl.searchAll);

export default router;
