// Request bodies of the /auth endpoints. They are inferred from the shared Zod schemas,
// so the backend validation and the frontend forms always agree.
export type { ChangeOwnPasswordInput, LoginInput, RegisterInput } from '@library/shared';
