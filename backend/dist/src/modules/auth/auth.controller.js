"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_formatter_1 = require("../../utils/response.formatter");
const requestContext_1 = require("../../shared/context/requestContext");
class AuthController {
    service = new auth_service_1.AuthService();
    registerOwner = async (req, res, next) => {
        try {
            const result = await this.service.registerOwner(req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Owner account registered successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    registerUser = async (req, res, next) => {
        try {
            const result = await this.service.registerUser(req.body);
            response_formatter_1.ApiResponse.success(res, result, 'User account registered successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const result = await this.service.login(req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    };
    getMe = async (req, res, next) => {
        try {
            const user = requestContext_1.RequestContext.getUser();
            if (!user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await this.service.getMe(user.id);
            response_formatter_1.ApiResponse.success(res, result, 'User profile retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const result = await this.service.forgotPassword(email);
            response_formatter_1.ApiResponse.success(res, result, 'OTP sent successfully');
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { email, otp, new_password } = req.body;
            const result = await this.service.resetPassword(email, otp, new_password);
            response_formatter_1.ApiResponse.success(res, result, 'Password reset successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
exports.default = AuthController;
