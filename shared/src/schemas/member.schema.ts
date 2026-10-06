import { z } from 'zod';
import { newPasswordField, registerSchema } from './auth.schema.js';
import { listQuerySchema } from './list-query.schema.js';

// Personal details staff can edit on a member (email and role are not edited here)
export const memberDetailsSchema = registerSchema.pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
  address: true,
});

// POST /members, option A: an existing guest (VIEWER) account becomes a member
export const createMemberFromExistingUserSchema = z.object({
  mode: z.literal('existingUser'),

  userId: z.uuid({ message: 'יש לבחור משתמש' }),
});

// POST /members, option B: a new person gets an account (MEMBER) and a membership together
export const createMemberWithNewPersonSchema = registerSchema.extend({
  mode: z.literal('newPerson'),

  password: newPasswordField,
});

// Body of POST /members - one of the two options above, chosen by `mode`
export const createMemberSchema = z.discriminatedUnion('mode', [
  createMemberFromExistingUserSchema,
  createMemberWithNewPersonSchema,
]);

// Query string of GET /members
export const memberListQuerySchema = listQuerySchema.extend({
  sortBy: z.enum(['lastName', 'firstName', 'registrationDate']).default('lastName'),
});

// Query string of GET /members/candidates (accounts that can become members)
export const memberCandidateQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
});

export type MemberDetailsInput = z.infer<typeof memberDetailsSchema>;
export type CreateMemberFromExistingUserInput = z.infer<typeof createMemberFromExistingUserSchema>;
export type CreateMemberWithNewPersonInput = z.infer<typeof createMemberWithNewPersonSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type MemberListQueryInput = z.infer<typeof memberListQuerySchema>;
export type MemberCandidateQueryInput = z.infer<typeof memberCandidateQuerySchema>;
