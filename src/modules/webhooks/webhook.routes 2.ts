import { Router } from 'express';
import { WebhookController } from './webhook.controller';

const router = Router();

// Endpoint for receiving driver events from vDrive-User-Driver-API
// Using a generic POST endpoint. You can add middleware here (e.g., API key validation) if needed.
router.post('/driver-events', WebhookController.handleDriverEvent);

export default router;
