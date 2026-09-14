import { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { requestContext } from '../utils/context.ts';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Snag the existing ID from the client or create a shiny new one
  const requestId = req.header('x-request-id') ?? randomUUID();
  
  // 2. Pass it back to the client in the response headers
  res.setHeader('x-request-id', requestId);

  // 3. 🔑 CRITICAL STEP: Put the ID into the box for this request chain!
  // Without this line, the logger's mixin will always return an empty object.
  requestContext.run(requestId, () => {
    next();
  });
}
