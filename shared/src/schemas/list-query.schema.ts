import { z } from 'zod';
import { RecordStatus } from '../enums/record-status.enum.js';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Common query string for list endpoints. Resources extend it with their own filters and sortBy.
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),

  search: z.string().trim().max(200).optional(),

  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  status: z.enum(RecordStatus).optional(),
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
