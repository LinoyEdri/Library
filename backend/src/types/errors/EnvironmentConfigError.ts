import { AppError } from './AppError.ts';
import statusCodes from 'http-status-codes';

export class EnvironmentConfigError extends AppError {
  readonly statusCode = statusCodes.INTERNAL_SERVER_ERROR;

  constructor(message: string) {
    super(message);
  }
}
