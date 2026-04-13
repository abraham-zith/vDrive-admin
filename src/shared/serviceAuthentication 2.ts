import { Request, Response, NextFunction } from 'express';
import config from '../config';

export const isServiceAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: 'Unauthorized: No API key provided',
        code: 'NO_API_KEY',
      });
    }

    const expectedApiKey = config.internalServiceApiKey;

    if (!expectedApiKey) {
      return res.status(500).json({
        statusCode: 500,
        success: false,
        message: 'Internal server error: API key not configured',
        code: 'API_KEY_NOT_CONFIGURED',
      });
    }

    if (apiKey !== expectedApiKey) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: 'Unauthorized: Invalid API key',
        code: 'INVALID_API_KEY',
      });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};
