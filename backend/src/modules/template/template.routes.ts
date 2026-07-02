import { Router } from 'express';
import { TemplateController } from './template.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { createTemplateSchema } from './validators/template.validator';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new TemplateController();

router.get(
  '/',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.OWNER]),
  controller.getTemplates
);

router.get(
  '/:id',
  requireAuth,
  controller.getTemplateById
);

router.post(
  '/',
  requireAuth,
  requireRole([UserRole.ADMIN]),
  validateRequest(createTemplateSchema),
  controller.createTemplate
);

export default router;
export { router };
