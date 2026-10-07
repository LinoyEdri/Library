import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordStatus, Role } from '@prisma/client';
import {
  LAST_ACTIVE_ADMIN_MESSAGE,
  userManagementService,
} from '../../services/user-management.service.ts';
import { userRepository } from '../../repositories/user.repository.ts';
import { ConflictError } from '../../types/errors/ConflictError.ts';
import type { UserWithAddressAndMembership } from '../../types/database/user-with-address-and-membership.types.ts';

vi.mock('../../repositories/user.repository.ts');
vi.mock('../../repositories/member.repository.ts');
vi.mock('../../services/audit-log.service.ts');
vi.mock('../../prisma/run-in-database-transaction.ts');

const actingAdmin = { id: 'admin-1', email: 'admin@example.com', role: Role.ADMIN, memberId: null };

// The only active admin in the system (someone other than the acting admin, e.g. after a data fix)
const lastActiveAdmin = {
  id: 'admin-2',
  role: Role.ADMIN,
  status: RecordStatus.ACTIVE,
  member: null,
} as unknown as UserWithAddressAndMembership;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(userRepository.findById).mockResolvedValue(lastActiveAdmin);
  vi.mocked(userRepository.countActiveAdmins).mockResolvedValue(1);
});

describe('last active administrator protection', () => {
  it('refuses to demote the last active admin', async () => {
    await expect(
      userManagementService.changeUserRole(actingAdmin, 'admin-2', Role.LIBRARIAN),
    ).rejects.toThrow(new ConflictError(LAST_ACTIVE_ADMIN_MESSAGE));

    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('refuses to disable the last active admin', async () => {
    await expect(userManagementService.disableUser(actingAdmin, 'admin-2')).rejects.toThrow(
      new ConflictError(LAST_ACTIVE_ADMIN_MESSAGE),
    );

    expect(userRepository.updateStatus).not.toHaveBeenCalled();
  });
});
