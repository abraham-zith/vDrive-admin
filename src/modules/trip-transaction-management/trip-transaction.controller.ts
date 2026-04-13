import { Request, Response, NextFunction } from 'express';
import { forwardRequest } from '../../shared/forwardRequest';
import config from '../../config';

export const TripTransactionManagementController = {
  async getTrips(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async getTripById(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async createTrip(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async updateTrip(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },
};
