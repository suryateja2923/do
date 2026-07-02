import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { registerOwnerSchema, registerUserSchema, loginSchema } from './dto/auth.dto';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// POST /api/v1/auth/register-owner
router.post('/register-owner', validateRequest(registerOwnerSchema), controller.registerOwner);

// POST /api/v1/auth/register-user
router.post('/register-user', validateRequest(registerUserSchema), controller.registerUser);

// POST /api/v1/auth/login
router.post('/login', validateRequest(loginSchema), controller.login);

// POST /api/v1/auth/login-admin  (same logic, used by web portals)
router.post('/login-admin', validateRequest(loginSchema), controller.login);

// GET /api/v1/auth/me
router.get('/me', requireAuth, controller.getMe);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', controller.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', controller.resetPassword);

export default router;
