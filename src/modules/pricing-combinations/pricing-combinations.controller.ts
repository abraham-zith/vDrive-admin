// src/modules/pricing-combinations/pricing-combinations.controller.ts
import { Request, Response } from 'express';
import { PricingCombinationService } from './pricing-combinations.service';

export const PricingCombinationController = {
  async getCombinations(req: Request, res: Response) {
    try {
      const combinations = await PricingCombinationService.getCombinations();
      res.status(200).json({
        success: true,
        data: combinations,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async createCombination(req: Request, res: Response) {
    try {
      const result = await PricingCombinationService.createCombination(req.body);
      res.status(201).json({
        success: true,
        message: 'Pricing combination created successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async updateCombination(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PricingCombinationService.updateCombination(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pricing combination updated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async deleteCombination(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PricingCombinationService.deleteCombination(id);
      res.status(200).json({
        success: true,
        message: 'Pricing combination deleted successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async bulkCreateCombinations(req: Request, res: Response) {
    try {
      const { combinations } = req.body;
      const result = await PricingCombinationService.bulkCreateCombinations(combinations);
      res.status(201).json({
        success: true,
        message: 'Pricing combinations added successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async saveMatrix(req: Request, res: Response) {
    try {
      const { combinations } = req.body;
      const result = await PricingCombinationService.saveMatrix(combinations);
      res.status(201).json({
        success: true,
        message: 'Pricing matrix updated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },

  async clearMatrix(req: Request, res: Response) {
    try {
      await PricingCombinationService.clearMatrix();
      res.status(200).json({
        success: true,
        message: 'Pricing matrix cleared successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  },
};
