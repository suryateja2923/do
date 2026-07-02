"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    /**
     * Send a standardized success JSON response
     */
    static success(res, data, message = 'Operation completed successfully', status = 200, meta) {
        return res.status(status).json({
            success: true,
            message,
            data,
            ...(meta && { meta }),
        });
    }
    /**
     * Send a standardized error JSON response
     */
    static error(res, message = 'An error occurred', status = 500, errors = null) {
        return res.status(status).json({
            success: false,
            message,
            ...(errors && { errors }),
        });
    }
}
exports.ApiResponse = ApiResponse;
exports.default = ApiResponse;
