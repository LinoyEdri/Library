import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordStatus, Role } from '@prisma/client';
import { bcryptPassword } from '../../utils/password-hash.ts';
import { authenticationService, INVALID_LOGIN_MESSAGE } from '../../services/authentication.service.ts';
import { userRepository } from '../../repositories/user.repository.ts';
import { ConflictError } from '../../types/errors/ConflictError.ts';
import { NotFoundError } from '../../types/errors/NotFoundError.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';
import type { UserWithAddress } from '../../types/dtos/user.dto.ts';

// Mock the repository and hashing modules - no real DB or bcrypt calls happen
vi.mock('../../repositories/user.repository.ts');
vi.mock('../../utils/password-hash.ts');

const activeUserWithAddress: UserWithAddress = {
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
    vi.clearAllMocks();
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

    expect(userRepository.updateLastLoginDate).toHaveBeenCalledWith('user-1', expect.any(Date));
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

    await expect(authenticationService.login(correctCredentials)).rejects.toThrow(UnauthorizedError);

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
    vi.clearAllMocks();
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

    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it('hashes the password and returns a safe user', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcryptPassword.hashPassword).mockResolvedValue('new-hash');
    vi.mocked(userRepository.createUser).mockResolvedValue(activeUserWithAddress);

    const safeUser = await authenticationService.register(registerInput);

    expect(userRepository.createUser).toHaveBeenCalledWith(registerInput, 'new-hash');
    expect(safeUser).not.toHaveProperty('passwordHash');
    expect(safeUser.address.city).toBe('Tel Aviv');
  });
});

describe('authenticationService.getCurrentUser', () => {
  it('throws NotFoundError when the user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(authenticationService.getCurrentUser('missing-id')).rejects.toThrow(NotFoundError);
  });
});
