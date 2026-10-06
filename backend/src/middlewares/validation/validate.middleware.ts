import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catch-async.ts';
import { ZodObject } from 'zod';
import { RequestLocation } from '../../types/http/request-location.types.ts';

export const validate = (location: RequestLocation, schema: ZodObject) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const resultData = await schema.parseAsync(req[location]);

    if (location === RequestLocation.QUERY) {
      Object.defineProperty(req, RequestLocation.QUERY, {
        value: resultData,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      req[location] = resultData;
    }

    next();
  });
};
