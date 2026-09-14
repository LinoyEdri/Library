import { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { requestContext } from '../../utils/context.ts';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Snag the existing ID from the client or create a shiny new one
  const requestId = req.header('x-request-id') ?? randomUUID();

  // 2. Expose it on the request itself, so consumers that don't go through the
  // logger (e.g. the error middleware's response body) can read it.
  req.requestId = requestId;

  // 3. Pass it back to the client in the response headers
  res.setHeader('x-request-id', requestId);

  // 4. 🔑 CRITICAL STEP: Put the ID into the box for this request chain!
  // Without this line, the logger's mixin will always return an empty object.
  requestContext.run(requestId, () => {
    next();
  });
}
