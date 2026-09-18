import { Router } from 'express';
import statusCodes from 'http-status-codes';
import { ApiResponse } from '../types/response.ts';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const healthData = {
    status: 'ok',
    service: 'library-api',
    timestamp: new Date().toISOString(),
  };

  res.status(statusCodes.OK).json(
    ApiResponse.success(
      healthData, 
      'Service is healthy'
    ),
  );
});

export default healthRouter;
