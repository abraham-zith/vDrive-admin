import { Router } from 'express';
import { AdminUserController } from './adminUser.controller';
import { AdminUserValidation } from './adminUser.validator';
import { validateBody, validateParams } from '../../utilities/helper';
import { requireRole } from '../../shared/rbac';

const router = Router();

router.get('/', AdminUserController.getAdminUsers);

router.get(
  '/:id',
  validateParams(AdminUserValidation.idValidation),
  AdminUserController.getAdminUserById
);

router.post(
  '/',
  requireRole('super_admin'),
  validateBody(AdminUserValidation.createAdminUserValidation),
  AdminUserController.createAdminUser
);

router.put(
  '/:id',
  requireRole('super_admin'),
  validateParams(AdminUserValidation.idValidation),
  validateBody(AdminUserValidation.updateAdminUserValidation),
  AdminUserController.updateAdminUser
);

router.delete(
  '/:id',
  requireRole('super_admin'),
  validateParams(AdminUserValidation.idValidation),
  AdminUserController.deleteAdminUser
);

export default router;
