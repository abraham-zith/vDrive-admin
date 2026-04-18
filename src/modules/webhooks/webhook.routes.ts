import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { isServiceAuthenticated } from '../../shared/serviceAuthentication';

const router = Router();

// Endpoint for receiving driver events from vDrive-User-Driver-API
// Using a generic POST endpoint with API key validation.
router.post('/driver-events', isServiceAuthenticated, WebhookController.handleDriverEvent);

export default router;
