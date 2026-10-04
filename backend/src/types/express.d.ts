import type { AccessTokenPayload } from "../schemas/access-token-payload.schema.ts";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AccessTokenPayload
    }
  }
}

export {};
