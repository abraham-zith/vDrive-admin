import { Router } from 'express';
import { TripTransactionManagementController } from './trip-transaction.controller';
import isAuthenticated from '../../shared/authentication';

const router = Router();

// Apply admin authentication to all routes
router.use(isAuthenticated);

// Trip management routes that proxy to user driver service
// Validation is handled by the user driver API
router.get('/', TripTransactionManagementController.getTrips);

router.get('/bytripid/:id', TripTransactionManagementController.getTripById);

router.post('/create', TripTransactionManagementController.createTrip);

router.patch('/update/:id', TripTransactionManagementController.updateTrip);

export default router;
