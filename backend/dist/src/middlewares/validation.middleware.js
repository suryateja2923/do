"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const exceptions_1 = require("../utils/exceptions");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorDetails = error.issues.map((err) => ({
                    field: err.path.slice(1).join('.') || err.path.join('.'),
                    message: err.message,
                }));
                next(new exceptions_1.BadRequestException('Validation failed', errorDetails));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
exports.default = exports.validateRequest;
