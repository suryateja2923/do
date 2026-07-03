import { Router } from 'express';
import { OwnerController } from './owner.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { requireOwnerResourceOwnership } from '../../middlewares/ownership.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const ctrl = new OwnerController();

// Protect all owner routes
router.use(requireAuth, requireRole([UserRole.OWNER]));

router.get('/application-status', ctrl.getApplicationStatus);
router.put('/resubmit-documents', ctrl.resubmitDocuments);
router.get('/profile', ctrl.getProfile);
router.get('/dashboard-stats', ctrl.getDashboardStats);

router.get('/properties', ctrl.getProperties);
router.post('/properties', ctrl.createProperty);
router.get('/properties/:id', requireOwnerResourceOwnership('property', 'id'), ctrl.getPropertyDetail);
router.put('/properties/:id', requireOwnerResourceOwnership('property', 'id'), ctrl.updateProperty);
router.post('/properties/:id/deactivate', requireOwnerResourceOwnership('property', 'id'), ctrl.deactivateProperty);
router.post('/properties/:id/images', requireOwnerResourceOwnership('property', 'id'), ctrl.uploadPropertyImages);
router.delete('/properties/:id/images/:imageId', ctrl.deletePropertyImage);

router.get('/properties/:propertyId/floors', requireOwnerResourceOwnership('property', 'propertyId'), ctrl.listFloors);
router.post('/properties/:propertyId/floors', requireOwnerResourceOwnership('property', 'propertyId'), ctrl.createFloor);
router.put('/properties/:propertyId/floors/:floorId', requireOwnerResourceOwnership('property', 'propertyId'), requireOwnerResourceOwnership('floor', 'floorId'), ctrl.updateFloor);
router.delete('/properties/:propertyId/floors/:floorId', requireOwnerResourceOwnership('property', 'propertyId'), requireOwnerResourceOwnership('floor', 'floorId'), ctrl.deleteFloor);

router.get('/floors/:floorId/rooms', requireOwnerResourceOwnership('floor', 'floorId'), ctrl.listRooms);
router.post('/floors/:floorId/rooms', requireOwnerResourceOwnership('floor', 'floorId'), ctrl.createRoom);
router.put('/rooms/:roomId', requireOwnerResourceOwnership('room', 'roomId'), ctrl.updateRoom);
router.delete('/rooms/:roomId', requireOwnerResourceOwnership('room', 'roomId'), ctrl.deleteRoom);

router.get('/rooms/:roomId/beds', requireOwnerResourceOwnership('room', 'roomId'), ctrl.listBeds);
router.post('/rooms/:roomId/beds', requireOwnerResourceOwnership('room', 'roomId'), ctrl.createBed);
router.put('/beds/:bedId', requireOwnerResourceOwnership('bed', 'bedId'), ctrl.updateBed);
router.delete('/beds/:bedId', requireOwnerResourceOwnership('bed', 'bedId'), ctrl.deleteBed);

router.get('/bookings', ctrl.getBookings);
router.post('/bookings/:id/verify', requireOwnerResourceOwnership('booking', 'id'), ctrl.verifyBooking);
router.get('/bookings/:id/timeline', requireOwnerResourceOwnership('booking', 'id'), ctrl.getBookingTimeline);

router.get('/tenants', ctrl.getTenants);
router.get('/tenants/:id', requireOwnerResourceOwnership('tenant', 'id'), ctrl.getTenantDetail);

router.get('/complaints', ctrl.getComplaints);
router.post('/complaints/:id/replies', requireOwnerResourceOwnership('complaint', 'id'), ctrl.replyComplaint);
router.post('/complaints/:id/assign', requireOwnerResourceOwnership('complaint', 'id'), ctrl.assignComplaint);
router.post('/complaints/:id/status', requireOwnerResourceOwnership('complaint', 'id'), ctrl.updateComplaintStatus);

router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationAsRead);
router.post('/notifications/send', ctrl.sendNotification);

router.get('/reports', ctrl.getReports);
router.get('/search', ctrl.searchAll);

export default router;
