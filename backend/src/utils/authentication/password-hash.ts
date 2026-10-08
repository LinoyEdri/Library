import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Async versions so hashing does not block the event loop
export const bcryptPassword = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  },
};
