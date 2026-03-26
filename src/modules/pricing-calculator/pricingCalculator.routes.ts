import { Router } from 'express';
import { PricingCalculatorController } from './pricingCalculator.controller';

const router = Router();

// Endpoint called by user-driver backend or frontend
router.post('/calculate-all-types', PricingCalculatorController.calculateAllTypes);

export default router;
