"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_formatter_1 = require("../../utils/response.formatter");
class AdminController {
    service = new admin_service_1.AdminService();
    getDashboardStats = async (req, res, next) => {
        try {
            const data = await this.service.getDashboardStats();
            response_formatter_1.ApiResponse.success(res, data, 'Dashboard statistics retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    getOwners = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getOwners(page, limit);
            response_formatter_1.ApiResponse.success(res, result.owners, 'Owners retrieved', 200, { total: result.total, page, limit });
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
            response_formatter_1.ApiResponse.success(res, result, `Owner ${status.toLowerCase()} successfully`);
        }
        catch (error) {
            next(error);
        }
    };
    getProperties = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getProperties(page, limit);
            response_formatter_1.ApiResponse.success(res, result.properties, 'Properties retrieved', 200, { total: result.total, page, limit });
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
            response_formatter_1.ApiResponse.success(res, result, `Property ${status.toLowerCase()} successfully`);
        }
        catch (error) {
            next(error);
        }
    };
    getBookings = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getBookings(page, limit);
            response_formatter_1.ApiResponse.success(res, result.bookings, 'Bookings retrieved', 200, { total: result.total, page, limit });
        }
        catch (error) {
            next(error);
        }
    };
    getComplaints = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getComplaints(page, limit);
            response_formatter_1.ApiResponse.success(res, result.complaints, 'Complaints retrieved', 200, { total: result.total, page, limit });
        }
        catch (error) {
            next(error);
        }
    };
    getManagers = async (req, res, next) => {
        try {
            const managers = await this.service.getManagers();
            response_formatter_1.ApiResponse.success(res, managers, 'Managers retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    getUsers = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getUsers(page, limit);
            response_formatter_1.ApiResponse.success(res, result.users, 'Users retrieved', 200, { total: result.total, page, limit });
        }
        catch (error) {
            next(error);
        }
    };
    getPayments = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getPayments(page, limit);
            response_formatter_1.ApiResponse.success(res, result.payments, 'Payments retrieved', 200, { total: result.total, page, limit });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AdminController = AdminController;
exports.default = AdminController;
