import { z } from 'zod';
import { Role } from '@prisma/client';

// Claims stored inside the JWT access token (backend only)
export const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  role: z.enum(Role),
});
