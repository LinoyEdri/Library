import statusCodes from 'http-status-codes';
import type { BusinessErrorCode } from '@library/shared';
import { AppError } from './AppError.ts';

// The request breaks a business rule; `errorCode` tells the client which one.
// 409 by default; a rule can use a closer status (e.g. 404 for an unknown account).
export class BusinessRuleError extends AppError {
  readonly statusCode: number;

  readonly errorCode: BusinessErrorCode;

  constructor(
    errorCode: BusinessErrorCode,
    message: string,
    statusCode: number = statusCodes.CONFLICT,
  ) {
    super(message);

    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}
