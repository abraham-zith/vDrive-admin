import { Request, Response, NextFunction } from 'express';
import { forwardRequest } from '../../shared/forwardRequest';
import config from '../../config';

export const UserManagementController = {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async blockUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },
  async suspendUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async unsuspendUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async disableUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async enableUser(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    return forwardRequest(req, res, next, config.userDriverApiUrl);
  },
};
