import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionType, RecordStatus, Role } from '@prisma/client';
import {
  INCORRECT_CURRENT_PASSWORD_MESSAGE,
  profileService,
} from '../../services/profile.service.ts';
import { userRepository } from '../../repositories/user.repository.ts';
import { auditLogService } from '../../services/audit-log.service.ts';
import { runInDatabaseTransaction } from '../../prisma/run-in-database-transaction.ts';
import { bcryptPassword } from '../../utils/authentication/password-hash.ts';
import { ValidationError } from '../../types/errors/BadRequestError.ts';
import type { UserWithAddressAndMembership } from '../../types/database/user-with-address-and-membership.types.ts';

vi.mock('../../repositories/user.repository.ts');
vi.mock('../../services/audit-log.service.ts');
vi.mock('../../prisma/run-in-database-transaction.ts');
vi.mock('../../utils/authentication/password-hash.ts');

const actingUser = {
  id: 'user-1',
  email: 'dana@example.com',
  role: Role.MEMBER,
  memberId: 'member-1',
};

const existingUser: UserWithAddressAndMembership = {
  id: 'user-1',
  firstName: 'דנה',
  lastName: 'כהן',
  email: 'dana@example.com',
  passwordHash: 'current-hash',
  phoneNumber: '0501234567',
  addressId: 'address-1',
  status: RecordStatus.ACTIVE,
  role: Role.MEMBER,
  lastLoginDate: null,
  createdDate: new Date('2026-01-01T00:00:00.000Z'),
  updatedDate: new Date('2026-01-01T00:00:00.000Z'),
  disabledDate: null,
  disabledByUserId: null,
  createdByUserId: null,
  member: null,
  address: {
    id: 'address-1',
    street: 'הרצל',
    houseNumber: '12',
    apartmentOrUnit: '4',
    city: 'תל אביב',
    postalCode: null,
    country: 'Israel',
  },
};

const unchangedProfile = {
  firstName: existingUser.firstName,
  lastName: existingUser.lastName,
  phoneNumber: existingUser.phoneNumber,
  address: {
    street: existingUser.address.street,
    houseNumber: existingUser.address.houseNumber,
    apartmentOrUnit: existingUser.address.apartmentOrUnit,
    city: existingUser.address.city,
    postalCode: null,
    country: existingUser.address.country,
  },
};

const recordedActionTypes = () =>
  vi.mocked(auditLogService.recordAuditLogEntry).mock.calls.map(([entry]) => entry.actionType);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(runInDatabaseTransaction).mockImplementation((work) => work({} as never));
  vi.mocked(userRepository.findById).mockResolvedValue(existingUser);
});

describe('profileService.updateOwnProfile', () => {
  it('audits only USER_UPDATED when just the name changed', async () => {
    vi.mocked(userRepository.updateProfileWithAddress).mockResolvedValue({
      ...existingUser,
      firstName: 'דניאלה',
    });

    const updatedUser = await profileService.updateOwnProfile(actingUser, {
      ...unchangedProfile,
      firstName: 'דניאלה',
    });

    expect(updatedUser.firstName).toBe('דניאלה');
    expect(recordedActionTypes()).toEqual([ActionType.USER_UPDATED]);
  });

  it('audits only ADDRESS_UPDATED when just the address changed', async () => {
    vi.mocked(userRepository.updateProfileWithAddress).mockResolvedValue({
      ...existingUser,
      address: { ...existingUser.address, city: 'חיפה' },
    });

    await profileService.updateOwnProfile(actingUser, {
      ...unchangedProfile,
      address: { ...unchangedProfile.address, city: 'חיפה' },
    });

    expect(recordedActionTypes()).toEqual([ActionType.ADDRESS_UPDATED]);
  });

  it('writes no audit entry when nothing changed', async () => {
    vi.mocked(userRepository.updateProfileWithAddress).mockResolvedValue(existingUser);

    await profileService.updateOwnProfile(actingUser, unchangedProfile);

    expect(auditLogService.recordAuditLogEntry).not.toHaveBeenCalled();
  });
});

describe('profileService.changeOwnPassword', () => {
  const passwords = { currentPassword: 'OldPassword1', newPassword: 'NewPassword1' };

  it('rejects a wrong current password with a 400 ValidationError', async () => {
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);

    await expect(profileService.changeOwnPassword(actingUser, passwords)).rejects.toThrow(
      new ValidationError(INCORRECT_CURRENT_PASSWORD_MESSAGE),
    );

    expect(userRepository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('stores the new hash and audits USER_PASSWORD_CHANGED', async () => {
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(true);
    vi.mocked(bcryptPassword.hashPassword).mockResolvedValue('new-hash');

    await profileService.changeOwnPassword(actingUser, passwords);

    expect(userRepository.updatePasswordHash).toHaveBeenCalledWith(
      'user-1',
      'new-hash',
      expect.anything(),
    );
    expect(recordedActionTypes()).toEqual([ActionType.USER_PASSWORD_CHANGED]);
  });
});
