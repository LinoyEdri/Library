import bcrypt from 'bcryptjs';
import { saltRounds } from '../config/env.ts';

const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, saltRounds);
}

const comparePassword = (password: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
}

export { hashPassword, comparePassword };