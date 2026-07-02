"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const response_formatter_1 = require("../../utils/response.formatter");
const requestContext_1 = require("../../shared/context/requestContext");
class UserController {
    service = new user_service_1.UserService();
    getTenantId() {
        const user = requestContext_1.RequestContext.getUser();
        if (!user || !user.profileId) {
            throw new Error('Tenant profile not found or user is not logged in');
        }
        return user.profileId;
    }
    getUserId() {
        const user = requestContext_1.RequestContext.getUser();
        if (!user) {
            throw new Error('User not logged in');
        }
        return user.id;
    }
    getProfile = async (req, res, next) => {
        try {
            const userId = this.getUserId();
            const profile = await this.service.getProfile(userId);
            response_formatter_1.ApiResponse.success(res, profile, 'User profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const userId = this.getUserId();
            const user = await this.service.updateProfile(userId, req.body);
            response_formatter_1.ApiResponse.success(res, user, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    searchProperties = async (req, res, next) => {
        try {
            const properties = await this.service.searchProperties(req.query);
            response_formatter_1.ApiResponse.success(res, properties, 'Properties retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getPropertyDetail = async (req, res, next) => {
        try {
            const { id } = req.params;
            const property = await this.service.getPropertyDetail(id);
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            response_formatter_1.ApiResponse.success(res, property, 'Property detail retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getFavorites = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const favorites = await this.service.getFavorites(tenantId);
            response_formatter_1.ApiResponse.success(res, favorites, 'Favorites retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    addFavorite = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const { id } = req.params;
            const result = await this.service.addFavorite(tenantId, id);
            response_formatter_1.ApiResponse.success(res, result, 'Added to favorites');
        }
        catch (error) {
            next(error);
        }
    };
    removeFavorite = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const { id } = req.params;
            const result = await this.service.removeFavorite(tenantId, id);
            response_formatter_1.ApiResponse.success(res, result, 'Removed from favorites');
        }
        catch (error) {
            next(error);
        }
    };
    getBookings = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const bookings = await this.service.getBookings(tenantId);
            response_formatter_1.ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    createBooking = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const userId = this.getUserId();
            const { bedId, expectedMoveIn } = req.body;
            const booking = await this.service.createBooking(tenantId, userId, bedId, new Date(expectedMoveIn));
            response_formatter_1.ApiResponse.success(res, booking, 'Booking created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    cancelBooking = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const { id } = req.params;
            const result = await this.service.cancelBooking(tenantId, id);
            response_formatter_1.ApiResponse.success(res, result, 'Booking cancelled successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getComplaints = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const complaints = await this.service.getComplaints(tenantId);
            response_formatter_1.ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    createComplaint = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const complaint = await this.service.createComplaint(tenantId, req.body);
            response_formatter_1.ApiResponse.success(res, complaint, 'Complaint registered successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    getNotifications = async (req, res, next) => {
        try {
            const userId = this.getUserId();
            const notifications = await this.service.getNotifications(userId);
            response_formatter_1.ApiResponse.success(res, notifications, 'Notifications retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    markNotificationAsRead = async (req, res, next) => {
        try {
            const userId = this.getUserId();
            const { id } = req.params;
            const result = await this.service.markNotificationAsRead(userId, id);
            response_formatter_1.ApiResponse.success(res, result, 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    };
    createReview = async (req, res, next) => {
        try {
            const tenantId = this.getTenantId();
            const review = await this.service.createReview(tenantId, req.body);
            response_formatter_1.ApiResponse.success(res, review, 'Review submitted successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserController = UserController;
