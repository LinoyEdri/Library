import { StatusCodes } from 'http-status-codes';
import { HebrewTexts } from '../constants/hebrew-texts';
import { getHebrewErrorMessage } from './get-hebrew-error-message';

// Role change / disable errors: a 409 here means the last active admin (or the same role)
export const getUserActionErrorMessage = (error: unknown): string =>
  getHebrewErrorMessage(error, {
    [StatusCodes.CONFLICT]: HebrewTexts.users.lastActiveAdmin,
  });
