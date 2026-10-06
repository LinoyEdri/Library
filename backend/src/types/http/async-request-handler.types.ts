import type { NextFunction, Request, Response } from 'express';

// Express handler written as an async function
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;
