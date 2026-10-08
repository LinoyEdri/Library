import type { z } from 'zod';
import type { accessTokenPayloadSchema } from '../../schemas/access-token-payload.schema.ts';

// Claims stored inside the JWT access token: { sub, email, role }
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
