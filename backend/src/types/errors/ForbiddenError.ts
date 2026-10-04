import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

// 403 - the user is authenticated but their role may not perform this action
export class ForbiddenError extends AppError {
  readonly statusCode = statusCodes.FORBIDDEN;

  constructor(message: string) {
    super(message);
  }
}
