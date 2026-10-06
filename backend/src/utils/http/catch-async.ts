import type { NextFunction, Request, Response } from 'express';
import type { AsyncRequestHandler } from '../../types/http/async-request-handler.types.ts';

// Forwards errors from an async handler to the error middleware
export const catchAsync = (handler: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};
