import type { ActionType, EntityType, Role } from '@prisma/client';

// What happened, who did it, and which record it affected
export interface AuditLogEntryInput {
  actionType: ActionType;
  actionUserId: string;
  actionUserRole: Role;
  affectedType: EntityType;
  affectedRecordId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  additionalContext?: unknown;
}
