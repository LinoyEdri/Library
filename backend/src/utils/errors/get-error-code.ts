import { BusinessRuleError } from '../../types/errors/BusinessRuleError.ts';
import { getStatusText } from '../http/status-text.ts';

// `error.code` in the response: the business rule code when there is one, otherwise e.g. "NOT_FOUND"
export const getErrorCode = (error: unknown, statusCode: number): string =>
  error instanceof BusinessRuleError ? error.errorCode : getStatusText(statusCode);
