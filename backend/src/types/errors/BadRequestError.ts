import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

export class ValidationError extends AppError {
  readonly statusCode = statusCodes.BAD_REQUEST;

  constructor(message: string) {
    super(message);
  }
}
