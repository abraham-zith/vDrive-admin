import { Router } from 'express';
import { SosManagementController } from './sosManagement.controller';

const router = Router();

router.get('/active', SosManagementController.getActiveSos);
router.post('/resolve', SosManagementController.resolveSos);

export default router;
