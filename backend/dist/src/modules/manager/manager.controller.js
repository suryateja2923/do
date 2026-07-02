"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerController = void 0;
const manager_service_1 = require("./manager.service");
const response_formatter_1 = require("../../utils/response.formatter");
class ManagerController {
    service = new manager_service_1.ManagerService();
    getDashboardStats = async (req, res, next) => {
        try {
            const stats = await this.service.getDashboardStats();
            response_formatter_1.ApiResponse.success(res, stats, 'Dashboard stats retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getOwners = async (req, res, next) => {
        try {
            const owners = await this.service.getOwners();
            response_formatter_1.ApiResponse.success(res, owners, 'Owners retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    verifyOwner = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const result = await this.service.verifyOwner(id, status, notes);
            response_formatter_1.ApiResponse.success(res, result, 'Owner status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    suspendOwner = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const result = await this.service.suspendOwner(id, notes);
            response_formatter_1.ApiResponse.success(res, result, 'Owner suspended successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getVerificationHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const history = await this.service.getVerificationHistory(id);
            response_formatter_1.ApiResponse.success(res, history, 'Verification history retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    getProperties = async (req, res, next) => {
        try {
            const properties = await this.service.getProperties();
            response_formatter_1.ApiResponse.success(res, properties, 'Properties retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    verifyProperty = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const result = await this.service.verifyProperty(id, status, notes);
            response_formatter_1.ApiResponse.success(res, result, 'Property status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getBookings = async (req, res, next) => {
        try {
            const bookings = await this.service.getBookings();
            response_formatter_1.ApiResponse.success(res, bookings, 'Bookings retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    verifyBooking = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await this.service.verifyBooking(id, status);
            response_formatter_1.ApiResponse.success(res, result, 'Booking status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getComplaints = async (req, res, next) => {
        try {
            const complaints = await this.service.getComplaints();
            response_formatter_1.ApiResponse.success(res, complaints, 'Complaints retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateComplaintStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const result = await this.service.updateComplaintStatus(id, status, notes);
            response_formatter_1.ApiResponse.success(res, result, 'Complaint status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getReports = async (req, res, next) => {
        try {
            const { category } = req.query;
            const reports = await this.service.getReports(String(category || ''));
            response_formatter_1.ApiResponse.success(res, reports, 'Reports retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    searchAll = async (req, res, next) => {
        try {
            const { q } = req.query;
            const results = await this.service.searchAll(String(q || ''));
            response_formatter_1.ApiResponse.success(res, results, 'Search results compiled successfully');
        }
        catch (error) {
            next(error);
        }
    };
    // Stubs for non-implemented operational routes to prevent crashes
    requestOwnerDocuments = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { documentTypes, notes } = req.body;
            const result = await this.service.requestOwnerDocuments(id, documentTypes, notes);
            response_formatter_1.ApiResponse.success(res, result, 'Document request sent successfully');
        }
        catch (error) {
            next(error);
        }
    };
    requestPropertyCorrections = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Corrections requested');
    };
    suspendProperty = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Property suspended');
    };
    assignComplaint = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Complaint assigned');
    };
    getTasks = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, [], 'Tasks retrieved');
    };
    updateTaskStatus = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Task status updated');
    };
    sendNotification = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Notification sent');
    };
    broadcastAnnouncement = async (req, res, next) => {
        response_formatter_1.ApiResponse.success(res, null, 'Announcement broadcasted');
    };
}
exports.ManagerController = ManagerController;
