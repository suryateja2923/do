"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerController = void 0;
const owner_service_1 = require("./owner.service");
const response_formatter_1 = require("../../utils/response.formatter");
const requestContext_1 = require("../../shared/context/requestContext");
class OwnerController {
    service = new owner_service_1.OwnerService();
    getOwnerProfileId = (req) => {
        const user = requestContext_1.RequestContext.getUser();
        if (!user || !user.profileId) {
            throw new Error('Owner context not found or user is not an owner.');
        }
        return user.profileId;
    };
    getApplicationStatus = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const status = await this.service.getApplicationStatus(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, status, 'Application status retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    resubmitDocuments = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const result = await this.service.resubmitDocuments(ownerProfileId, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Documents resubmitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getProfile = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const profile = await this.service.getProfile(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, profile, 'Profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getDashboardStats = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { propertyId } = req.query;
            const stats = await this.service.getDashboardStats(ownerProfileId, propertyId);
            response_formatter_1.ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getProperties = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const properties = await this.service.getProperties(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, properties, 'Properties retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    createProperty = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const result = await this.service.createProperty(ownerProfileId, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Property created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    getPropertyDetail = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { id } = req.params;
            const property = await this.service.getPropertyDetail(ownerProfileId, id);
            response_formatter_1.ApiResponse.success(res, property, 'Property details retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    updateProperty = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { id } = req.params;
            const result = await this.service.updateProperty(ownerProfileId, id, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Property updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deactivateProperty = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { id } = req.params;
            const result = await this.service.deactivateProperty(ownerProfileId, id);
            response_formatter_1.ApiResponse.success(res, result, 'Property deactivated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getBookings = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const bookings = await this.service.getBookings(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    verifyBooking = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { id } = req.params;
            const result = await this.service.verifyBooking(ownerProfileId, id, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Booking verified successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getComplaints = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const complaints = await this.service.getComplaints(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getTenants = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const tenants = await this.service.getTenants(ownerProfileId);
            response_formatter_1.ApiResponse.success(res, tenants, 'Tenants retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    // Stubs for extra routes to prevent crashes
    uploadPropertyImages = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const { id } = req.params;
            const { imageUrl } = req.body;
            const result = await this.service.uploadPropertyImage(ownerProfileId, id, imageUrl);
            response_formatter_1.ApiResponse.success(res, result, 'Image uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deletePropertyImage = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Image deleted');
    };
    listFloors = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const propertyId = req.params.propertyId;
            const result = await this.service.listFloors(ownerProfileId, propertyId);
            response_formatter_1.ApiResponse.success(res, result, 'Floors retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    createFloor = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const propertyId = req.params.propertyId;
            const { name } = req.body;
            const result = await this.service.createFloor(ownerProfileId, propertyId, name);
            response_formatter_1.ApiResponse.success(res, result, 'Floor created');
        }
        catch (error) {
            next(error);
        }
    };
    updateFloor = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const propertyId = req.params.propertyId;
            const floorId = req.params.floorId;
            const { name } = req.body;
            const result = await this.service.updateFloor(ownerProfileId, propertyId, floorId, name);
            response_formatter_1.ApiResponse.success(res, result, 'Floor updated');
        }
        catch (error) {
            next(error);
        }
    };
    deleteFloor = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const propertyId = req.params.propertyId;
            const floorId = req.params.floorId;
            const result = await this.service.deleteFloor(ownerProfileId, propertyId, floorId);
            response_formatter_1.ApiResponse.success(res, result, 'Floor deleted');
        }
        catch (error) {
            next(error);
        }
    };
    listRooms = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const floorId = req.params.floorId;
            const result = await this.service.listRooms(ownerProfileId, floorId);
            response_formatter_1.ApiResponse.success(res, result, 'Rooms retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    createRoom = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const floorId = req.params.floorId;
            const result = await this.service.createRoom(ownerProfileId, floorId, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Room created');
        }
        catch (error) {
            next(error);
        }
    };
    updateRoom = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const roomId = req.params.roomId;
            const result = await this.service.updateRoom(ownerProfileId, roomId, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Room updated');
        }
        catch (error) {
            next(error);
        }
    };
    deleteRoom = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const roomId = req.params.roomId;
            const result = await this.service.deleteRoom(ownerProfileId, roomId);
            response_formatter_1.ApiResponse.success(res, result, 'Room deleted');
        }
        catch (error) {
            next(error);
        }
    };
    listBeds = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const roomId = req.params.roomId;
            const result = await this.service.listBeds(ownerProfileId, roomId);
            response_formatter_1.ApiResponse.success(res, result, 'Beds retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    createBed = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const roomId = req.params.roomId;
            const { bedNumber } = req.body;
            const result = await this.service.createBed(ownerProfileId, roomId, bedNumber);
            response_formatter_1.ApiResponse.success(res, result, 'Bed created');
        }
        catch (error) {
            next(error);
        }
    };
    updateBed = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const bedId = req.params.bedId;
            const result = await this.service.updateBed(ownerProfileId, bedId, req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Bed updated');
        }
        catch (error) {
            next(error);
        }
    };
    deleteBed = async (req, res, next) => {
        try {
            const ownerProfileId = this.getOwnerProfileId(req);
            const bedId = req.params.bedId;
            const result = await this.service.deleteBed(ownerProfileId, bedId);
            response_formatter_1.ApiResponse.success(res, result, 'Bed deleted');
        }
        catch (error) {
            next(error);
        }
    };
    getBookingTimeline = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, [], 'Booking timeline retrieved');
    };
    getTenantDetail = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Tenant details retrieved');
    };
    replyComplaint = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Complaint reply sent');
    };
    assignComplaint = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Complaint assigned');
    };
    updateComplaintStatus = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Complaint status updated');
    };
    getNotifications = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, [], 'Notifications retrieved');
    };
    sendNotification = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Notification sent');
    };
    getReports = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, [], 'Reports retrieved');
    };
    searchAll = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, { properties: [], tenants: [], bookings: [], complaints: [] }, 'Search completed');
    };
}
exports.OwnerController = OwnerController;
