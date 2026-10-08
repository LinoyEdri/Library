import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catch-async.ts';
import type { ZodType } from 'zod';
import { RequestLocation } from '../../types/http/request-location.types.ts';

// Any Zod schema works, including unions such as the two "create member" body shapes
export const validate = (location: RequestLocation, schema: ZodType) => {
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
