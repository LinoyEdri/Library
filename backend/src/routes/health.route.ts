import { Router } from 'express';
import status from 'http-status-codes';
import { ApiResponse } from '../types/response.ts';

const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the operational status of the service
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     service:
 *                       type: string
 *                       example: library-api
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: '2026-09-14T11:45:33Z'
 */
healthRouter.get('/', (_request, response) => {
  const healthData = {
    status: 'ok',
    service: 'library-api',
    timestamp: new Date().toISOString(),
  };

  response.status(status.OK).json(
    ApiResponse.success(healthData, 'Service is healthy'),
  );
});

export default healthRouter;
