
import { Request, Response, NextFunction } from 'express';
import { RechargePlanService } from './rechargePlan.service';
import { forwardRequest } from '../../shared/forwardRequest';
import config from '../../config';
import { successResponse } from '../../shared/errorHandler';

export const RechargePlanController = {


  async getRechargePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await RechargePlanService.getPlans(page, limit);

      return successResponse(res, 200, "Recharge plans fetched successfully", {
        data: result.data,
        total: result.total
      });
    } catch (err) {
      next(err);
    }
  },

  async getRechargePlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await RechargePlanService.getPlanById(Number(req.params.id));
      return successResponse(res, 200, "Recharge plan fetched successfully", plan);
    } catch (err) {
      next(err);
    }
  },
  
  async createRechargePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await RechargePlanService.createPlan(req.body);
      return successResponse(res, 201, "Recharge plan created successfully", plan);
    } catch (err) {
      next(err);
    }
  },

  
  async editRechargePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await RechargePlanService.updatePlan(Number(req.params.id), req.body);
      return successResponse(res, 200, "Recharge plan updated successfully", plan);
    } catch (err) {
      next(err);
    }
  },

  
  async toggleRechargePlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const plan = await RechargePlanService.toggleStatus(Number(req.params.id), isActive);
      return successResponse(res, 200, "Recharge plan status updated successfully", plan);
    } catch (err) {
      next(err);
    }
  },


  async deleteRechargePlan(req: Request, res: Response, next: NextFunction) {
    try {
      await RechargePlanService.deletePlan(Number(req.params.id));
      return successResponse(res, 200, "Recharge plan deleted successfully");
    } catch (err) {
      next(err);
    }
  },

  async getAllActiveDriverSubscriptions(req: Request, res: Response, next: NextFunction) {
    // This data lives in User-Driver API
    const targetPath = '/api/subscriptions/all-active'; // Map to the correct endpoint in user-driver-api
    return forwardRequest(req, res, next, config.userDriverApiUrl, targetPath);
  },
};
