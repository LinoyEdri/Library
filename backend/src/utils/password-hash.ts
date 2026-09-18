import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const bcryptPassword = {
  hashPassword(password: string): string {
    return bcrypt.hashSync(password, SALT_ROUNDS)
  },

  comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  },
};