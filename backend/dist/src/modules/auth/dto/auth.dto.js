"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = exports.loginSchema = exports.registerOwnerSchema = void 0;
const zod_1 = require("zod");
exports.registerOwnerSchema = zod_1.z.object({
    body: zod_1.z.object({
        first_name: zod_1.z.string().optional(),
        last_name: zod_1.z.string().optional(),
        fullName: zod_1.z.string().optional(),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().optional(),
        mobile: zod_1.z.string().optional(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
        business_name: zod_1.z.string().optional(),
        businessName: zod_1.z.string().optional(),
        gst_number: zod_1.z.string().optional(),
        pan_number: zod_1.z.string().optional(),
        documents: zod_1.z.object({
            id_url: zod_1.z.string().optional(),
            pan_url: zod_1.z.string().optional(),
            property_proof_url: zod_1.z.string().optional(),
            profile_photo_url: zod_1.z.string().optional(),
        }).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        first_name: zod_1.z.string().min(1, 'First name is required'),
        last_name: zod_1.z.string().optional(),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    }),
});
