import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new UserController();

// Protect all routes under /api/v1/user
router.use(requireAuth);
router.use(requireRole([UserRole.USER]));

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

router.get('/properties', controller.searchProperties);
router.get('/properties/:id', controller.getPropertyDetail);

router.get('/favorites', controller.getFavorites);
router.post('/properties/:id/favorite', controller.addFavorite);
router.delete('/properties/:id/favorite', controller.removeFavorite);

router.get('/bookings', controller.getBookings);
router.post('/bookings', controller.createBooking);
router.post('/bookings/:id/cancel', controller.cancelBooking);

router.get('/complaints', controller.getComplaints);
router.post('/complaints', controller.createComplaint);

router.get('/notifications', controller.getNotifications);
router.put('/notifications/:id/read', controller.markNotificationAsRead);

router.post('/reviews', controller.createReview);

export default router;
