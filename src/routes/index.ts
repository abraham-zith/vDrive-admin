// src/routes/index.ts
import { Router } from 'express';
import userRoutes from '../modules/admin-users/adminUser.routes';
import userManagementRoutes from '../modules/user-management/userManagement.routes';
import tripManagementRoutes from '../modules/trip-management/tripManagement.routes';
import authRoutes from '../modules/auth/auth.routes';
import isAuthenticated from '../shared/authentication';
import locationRoutes from '../modules/locations/location.routes';
import hotspotRoutes from '../modules/hotspots/hotspot.routes';
import priceSettingsRoutes from '../modules/price-settings/price.routes';
import packageRoutes from '../modules/packages/package.routes';
import s3Routes from '../modules/s3/s3.routes';
import driverReconciliationRoutes from '../modules/driver-reconciliation/driverReconciliation.routes';
import rechargePlanRoutes from '../modules/rechargePlan/rechargePlan.routes';
import pricingFareRulesRoutes from '../modules/pricing-fare-rules/pricingFareRules.routes';
import driverManagementRoutes from '../modules/driver-management/driverManagement.routes';
import webhookRoutes from '../modules/webhooks/webhook.routes';
import { isServiceAuthenticated } from '../shared/serviceAuthentication';

const router = Router();

router.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});
router.use('/auth', authRoutes);

// Webhook routes (secured with API key as it is called by internal Driver API)
router.use('/webhooks', isServiceAuthenticated, webhookRoutes);

router.use(isAuthenticated);

router.use('/locations', locationRoutes);
router.use('/hotspots', hotspotRoutes);
router.use('/price-settings', priceSettingsRoutes);
router.use('/packages', packageRoutes);
router.use('/admin-users', userRoutes);
router.use('/users', userManagementRoutes);
router.use('/drivers', driverManagementRoutes);
router.use('/trips', tripManagementRoutes);
router.use('/generate-presigned-url', s3Routes);
router.use('/driver-reconciliation', driverReconciliationRoutes);
router.use('/recharge-plans', rechargePlanRoutes);
router.use('/pricing-fare-rules', pricingFareRulesRoutes);

export default router;

