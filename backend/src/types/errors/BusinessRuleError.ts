import statusCodes from 'http-status-codes';
import type { BusinessErrorCode } from '@library/shared';
import { AppError } from './AppError.ts';

// 409 - the request is valid but breaks a business rule; `errorCode` tells the client which one
export class BusinessRuleError extends AppError {
  readonly statusCode = statusCodes.CONFLICT;

  readonly errorCode: BusinessErrorCode;

  constructor(errorCode: BusinessErrorCode, message: string) {
    super(message);

    this.errorCode = errorCode;
  }
}
