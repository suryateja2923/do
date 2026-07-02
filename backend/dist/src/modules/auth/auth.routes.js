"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const auth_dto_1 = require("./dto/auth.dto");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
// POST /api/v1/auth/register-owner
router.post('/register-owner', (0, validation_middleware_1.validateRequest)(auth_dto_1.registerOwnerSchema), controller.registerOwner);
// POST /api/v1/auth/register-user
router.post('/register-user', (0, validation_middleware_1.validateRequest)(auth_dto_1.registerUserSchema), controller.registerUser);
// POST /api/v1/auth/login
router.post('/login', (0, validation_middleware_1.validateRequest)(auth_dto_1.loginSchema), controller.login);
// POST /api/v1/auth/login-admin  (same logic, used by web portals)
router.post('/login-admin', (0, validation_middleware_1.validateRequest)(auth_dto_1.loginSchema), controller.login);
// GET /api/v1/auth/me
router.get('/me', auth_middleware_1.requireAuth, controller.getMe);
// POST /api/v1/auth/forgot-password
router.post('/forgot-password', controller.forgotPassword);
// POST /api/v1/auth/reset-password
router.post('/reset-password', controller.resetPassword);
exports.default = router;
