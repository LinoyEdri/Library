// src/services/__tests__/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bcryptPassword } from '../../utils/password-hash.ts';
import { userService } from '../../services/user.service.ts';
import { userRepository } from '../../repositories/user.repository.ts';
import { NotFoundError } from '../../types/errors/NotFoundError.ts';
import { UnauthorizedError } from '../../types/errors/UnauthorizedError.ts';
import { RecordStatus, Role } from '@prisma/client';
import { logger } from '../../logger/logger.ts';

// Mock the repository module entirely — no real DB calls happen
vi.mock('../../repositories/user.repository.ts');
vi.mock('../../utils/password-hash.ts');
logger.info(
    vi.isMockFunction(userRepository.findByEmail)
); // should log true


describe('userService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const resolvedValue = {
    id: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@example.com',
    passwordHash: 'hashed',
    phoneNumber: '5551234567',
    addressId: 'address-1',
    status: RecordStatus.ACTIVE,
    role: Role.ADMIN,
    lastLoginDate: null,
    createdDate: new Date('2024-01-01T00:00:00.000Z'),
    updatedDate: new Date('2024-01-01T00:00:00.000Z'),
    disabledDate: null,
    disabledByUserId: null,
    createdByUserId: null,
  };
  const correctEmail = "test@example.com";
  const correctPassword = "correct-password";
  const nonExistentEmail = "missing@example.com";
  const wrongPassword = "wrong-password";

  it('returns a token on valid credentials', async () => {
    vi.mocked(userRepository.findByEmail)
        .mockResolvedValue(resolvedValue);
    vi.mocked(bcryptPassword.comparePassword)
        .mockResolvedValue(true);

    const result = await userService.login({
        email: correctEmail, 
        password: correctPassword
    });

    expect(result).toHaveProperty('accessToken');
  });

  it('throws NotFoundError for non-existent email', async () => {
    vi.mocked(userRepository.findByEmail)
        .mockResolvedValue(null);

    await expect(
      userService.login({
        email: nonExistentEmail, 
        password: correctPassword
    })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError for wrong password', async () => {
    vi.mocked(userRepository.findByEmail)
        .mockResolvedValue(resolvedValue);
    vi.mocked(bcryptPassword.comparePassword)
        .mockResolvedValue(false);

    await expect(
      userService.login({
        email: correctEmail, 
        password: wrongPassword
    })
    ).rejects.toThrow(NotFoundError); 
  });

  it('throws UnauthorizedError for a disabled account', async () => {
    vi.mocked(userRepository.findByEmail)
        .mockResolvedValue({
            ...resolvedValue,
            status: RecordStatus.DISABLED,
            disabledDate: new Date()
        });
    vi.mocked(bcryptPassword.comparePassword)
        .mockResolvedValue(true);

    await expect(
      userService.login({
        email: correctEmail, 
        password: correctPassword
    })
    ).rejects.toThrow(UnauthorizedError);
  });
});
