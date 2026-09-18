import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

export class NotFoundError extends AppError {
  readonly statusCode = statusCodes.NOT_FOUND;

  constructor(message: string) {
    super(message);
  }
}
