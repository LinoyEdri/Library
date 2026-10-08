import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ActionType, EntityType, Prisma, Role } from '@prisma/client';
import { auditLogService } from '../../services/audit-log.service.ts';
import { auditLogRepository } from '../../repositories/audit-log.repository.ts';

vi.mock('../../repositories/audit-log.repository.ts');

describe('auditLogService.recordAuditLogEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseEntry = {
    actionType: ActionType.USER_UPDATED,
    actionUserId: 'admin-1',
    actionUserRole: Role.ADMIN,
    affectedType: EntityType.USER,
    affectedRecordId: 'user-1',
  };

  it('removes password fields from previous and new values', async () => {
    await auditLogService.recordAuditLogEntry({
      ...baseEntry,
      previousValue: { email: 'old@example.com', passwordHash: 'secret-hash' },
      newValue: { email: 'new@example.com', password: 'plain-text' },
    });

    const savedData = vi.mocked(auditLogRepository.createAuditLogEntry).mock.calls[0][0];

    expect(savedData.previousValue).toEqual({ email: 'old@example.com' });
    expect(savedData.newValue).toEqual({ email: 'new@example.com' });
  });

  it('stores dates as ISO strings', async () => {
    const changeDate = new Date('2026-01-01T10:00:00.000Z');

    await auditLogService.recordAuditLogEntry({
      ...baseEntry,
      newValue: { disabledDate: changeDate },
    });

    const savedData = vi.mocked(auditLogRepository.createAuditLogEntry).mock.calls[0][0];

    expect(savedData.newValue).toEqual({ disabledDate: '2026-01-01T10:00:00.000Z' });
  });

  it('stores database NULL for missing optional values', async () => {
    await auditLogService.recordAuditLogEntry(baseEntry);

    const savedData = vi.mocked(auditLogRepository.createAuditLogEntry).mock.calls[0][0];

    expect(savedData.previousValue).toBe(Prisma.DbNull);
    expect(savedData.newValue).toBe(Prisma.DbNull);
    expect(savedData.additionalContext).toBe(Prisma.DbNull);
  });

  it('passes the transaction client through to the repository', async () => {
    const fakeTransactionClient = {} as never;

    await auditLogService.recordAuditLogEntry(baseEntry, fakeTransactionClient);

    expect(auditLogRepository.createAuditLogEntry).toHaveBeenCalledWith(
      expect.any(Object),
      fakeTransactionClient,
    );
  });
});
