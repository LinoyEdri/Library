import { AccessTokenPayload } from "../schemas/user.schema.ts";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AccessTokenPayload
    }
  }
}

export {};
