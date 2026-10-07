import { z } from 'zod';
import { Role } from '../enums/role.enum.js';
import { registerSchema } from './auth.schema.js';
import { listQuerySchema } from './list-query.schema.js';
import { emailField } from './schema-field-helpers.js';

const roleField = z.enum(Role, { message: 'יש לבחור תפקיד' });

// Body of POST /users: an admin creates an account with any role and an initial password
export const createUserSchema = registerSchema.extend({
  role: roleField,
});

// Body of PATCH /users/:id: account details (role and password are changed separately)
export const updateUserSchema = registerSchema
  .pick({
    firstName: true,
    lastName: true,
    phoneNumber: true,
    address: true,
  })
  .extend({
    email: emailField,
  });

// Body of PATCH /users/:id/role
export const changeUserRoleSchema = z.object({
  role: roleField,
});

// Query string of GET /users
export const userListQuerySchema = listQuerySchema.extend({
  role: z.enum(Role).optional(),
  sortBy: z.enum(['lastName', 'firstName', 'createdDate', 'lastLoginDate']).default('lastName'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
