
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
      const adminId = (req as any).user?.id;
      const plan = await RechargePlanService.createPlan(req.body, adminId);
      return successResponse(res, 201, "Recharge plan created successfully", plan);
    } catch (err) {
      next(err);
    }
  },

  
  async editRechargePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.id;
      const plan = await RechargePlanService.updatePlan(Number(req.params.id), req.body, adminId);
      return successResponse(res, 200, "Recharge plan updated successfully", plan);
    } catch (err) {
      next(err);
    }
  },

  
  async toggleRechargePlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.id;
      const { isActive } = req.body;
      const plan = await RechargePlanService.toggleStatus(Number(req.params.id), isActive, adminId);
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

  async getRechargePlanHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await RechargePlanService.getPlanHistory(Number(req.params.id));
      return successResponse(res, 200, "Recharge plan history fetched successfully", history);
    } catch (err) {
      next(err);
    }
  },

  async getAllActiveDriverSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await RechargePlanService.getActiveSubscriptions();
      return successResponse(res, 200, "Active subscriptions fetched successfully", subscriptions);
    } catch (err) {
      next(err);
    }
  },
};
