import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionType, RecordStatus, Role } from '@prisma/client';
import { bcryptPassword } from '../../utils/authentication/password-hash.ts';
import {
  authenticationService,
  INVALID_LOGIN_MESSAGE,
} from '../../services/authentication.service.ts';
import { userRepository } from '../../repositories/user.repository.ts';
import { ConflictError } from '../../types/errors/ConflictError.ts';
import { NotFoundError } from '../../types/errors/NotFoundError.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';
import type { UserWithAddressAndMembership } from '../../types/database/user-with-address-and-membership.types.ts';
import { auditLogService } from '../../services/audit-log.service.ts';
import { runInDatabaseTransaction } from '../../prisma/run-in-database-transaction.ts';

// Mock the repository, hashing, audit and transaction modules - no real DB or bcrypt calls happen
vi.mock('../../repositories/user.repository.ts');
vi.mock('../../utils/authentication/password-hash.ts');
vi.mock('../../services/audit-log.service.ts');
vi.mock('../../prisma/run-in-database-transaction.ts');

// The fake transaction simply runs the work with a dummy client
const runWorkWithoutRealTransaction = () => {
  vi.mocked(runInDatabaseTransaction).mockImplementation((work) => work({} as never));
};

const activeUserWithAddress: UserWithAddressAndMembership = {
  id: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'test@example.com',
  passwordHash: 'hashed',
  phoneNumber: '0551234567',
  addressId: 'address-1',
  status: RecordStatus.ACTIVE,
  role: Role.ADMIN,
  lastLoginDate: null,
  createdDate: new Date('2024-01-01T00:00:00.000Z'),
  updatedDate: new Date('2024-01-01T00:00:00.000Z'),
  disabledDate: null,
  disabledByUserId: null,
  createdByUserId: null,
  member: null,
  address: {
    id: 'address-1',
    street: 'Herzl',
    houseNumber: '12',
    apartmentOrUnit: '4',
    city: 'Tel Aviv',
    postalCode: null,
    country: 'Israel',
  },
};

const correctCredentials = { email: 'test@example.com', password: 'correct-password' };

describe('authenticationService.login', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    runWorkWithoutRealTransaction();
  });

  it('returns a bearer token, expiry and the safe user on valid credentials', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(true);
    vi.mocked(userRepository.updateLastLoginDate).mockResolvedValue({
      ...activeUserWithAddress,
      lastLoginDate: new Date(),
    });

    const result = await authenticationService.login(correctCredentials);

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.lastLoginDate).toBeInstanceOf(Date);
  });

  it('updates the last login date on success', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(true);
    vi.mocked(userRepository.updateLastLoginDate).mockResolvedValue(activeUserWithAddress);

    await authenticationService.login(correctCredentials);

    expect(userRepository.updateLastLoginDate).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
      expect.anything(),
    );
  });

  it('writes a USER_LOGIN_SUCCEEDED audit entry on success', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(true);
    vi.mocked(userRepository.updateLastLoginDate).mockResolvedValue(activeUserWithAddress);

    await authenticationService.login(correctCredentials);

    expect(auditLogService.recordAuditLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: ActionType.USER_LOGIN_SUCCEEDED,
        actionUserId: 'user-1',
      }),
      expect.anything(),
    );
  });

  it('writes a USER_LOGIN_FAILED audit entry for a wrong password on a known account', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);

    await expect(authenticationService.login(correctCredentials)).rejects.toThrow(
      UnauthorizedError,
    );

    expect(auditLogService.recordAuditLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: ActionType.USER_LOGIN_FAILED,
        additionalContext: { reason: 'WRONG_PASSWORD' },
      }),
    );
  });

  it('still returns the generic 401 when the failed-login audit write fails', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);
    vi.mocked(auditLogService.recordAuditLogEntry).mockRejectedValue(new Error('database down'));

    await expect(authenticationService.login(correctCredentials)).rejects.toThrow(
      new UnauthorizedError(INVALID_LOGIN_MESSAGE),
    );
  });

  it('throws the generic UnauthorizedError for a non-existent email', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);

    await expect(
      authenticationService.login({ email: 'missing@example.com', password: 'whatever' }),
    ).rejects.toThrow(new UnauthorizedError(INVALID_LOGIN_MESSAGE));
  });

  it('still runs a password comparison for unknown emails (timing equalizer)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);

    await expect(authenticationService.login(correctCredentials)).rejects.toThrow(
      UnauthorizedError,
    );

    expect(bcryptPassword.comparePassword).toHaveBeenCalledTimes(1);
  });

  it('throws the generic UnauthorizedError for a wrong password', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(false);

    await expect(
      authenticationService.login({ ...correctCredentials, password: 'wrong-password' }),
    ).rejects.toThrow(new UnauthorizedError(INVALID_LOGIN_MESSAGE));
  });

  it('throws the generic UnauthorizedError for a disabled account', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      ...activeUserWithAddress,
      status: RecordStatus.DISABLED,
      disabledDate: new Date(),
    });
    vi.mocked(bcryptPassword.comparePassword).mockResolvedValue(true);

    await expect(authenticationService.login(correctCredentials)).rejects.toThrow(
      new UnauthorizedError(INVALID_LOGIN_MESSAGE),
    );

    expect(userRepository.updateLastLoginDate).not.toHaveBeenCalled();
  });
});

describe('authenticationService.register', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    runWorkWithoutRealTransaction();
  });

  const registerInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@example.com',
    password: 'StrongPassword1',
    phoneNumber: '0551234567',
    address: activeUserWithAddress.address,
  };

  it('throws ConflictError when the email is already registered', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(activeUserWithAddress);

    await expect(authenticationService.register(registerInput)).rejects.toThrow(ConflictError);

    expect(userRepository.createUserWithAddress).not.toHaveBeenCalled();
  });

  it('hashes the password and returns a safe user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcryptPassword.hashPassword).mockResolvedValue('new-hash');
    vi.mocked(userRepository.createUserWithAddress).mockResolvedValue(activeUserWithAddress);

    const safeUser = await authenticationService.register(registerInput);

    expect(userRepository.createUserWithAddress).toHaveBeenCalledWith(
      registerInput,
      'new-hash',
      expect.anything(),
    );
    expect(safeUser).not.toHaveProperty('passwordHash');
    expect(safeUser.address.city).toBe('Tel Aviv');
  });

  it('writes a USER_CREATED audit entry inside the registration transaction', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcryptPassword.hashPassword).mockResolvedValue('new-hash');
    vi.mocked(userRepository.createUserWithAddress).mockResolvedValue(activeUserWithAddress);

    await authenticationService.register(registerInput);

    expect(runInDatabaseTransaction).toHaveBeenCalledTimes(1);
    expect(auditLogService.recordAuditLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: ActionType.USER_CREATED, affectedRecordId: 'user-1' }),
      expect.anything(),
    );
  });
});

describe('authenticationService.getCurrentUser', () => {
  it('throws NotFoundError when the user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(authenticationService.getCurrentUser('missing-id')).rejects.toThrow(NotFoundError);
  });
});
