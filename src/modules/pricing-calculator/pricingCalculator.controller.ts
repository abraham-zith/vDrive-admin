import { Request, Response, NextFunction } from 'express';
import { PricingCalculatorService } from './pricingCalculator.service';
import { PricingCalculatorValidator } from './pricingCalculator.validator';

export const PricingCalculatorController = {
  async calculateAllTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = PricingCalculatorValidator.calculateAllTypes.validate(req.body);
      if (error) {
        return res.status(422).json({
          error: 'Validation Error',
          message: error.details[0].message,
        });
      }

      const result = await PricingCalculatorService.calculateAllTypes(value);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },
};
