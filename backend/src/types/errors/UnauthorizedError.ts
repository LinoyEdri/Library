import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

export class UnauthorizedError extends AppError {
  readonly statusCode = statusCodes.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
  }
}
