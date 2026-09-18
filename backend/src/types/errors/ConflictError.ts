import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

export class ConflictError extends AppError {
  readonly statusCode = statusCodes.CONFLICT;

  constructor(message: string) {
    super(message);
  }
}
