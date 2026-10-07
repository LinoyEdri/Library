import type {
  CreateLoanInput,
  LoanResponse,
  LoanStatus,
  ProcessLoanReturnInput,
} from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string of GET /loans (members always get only their own loans)
export interface LoanListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: LoanStatus;
  memberId?: string;
  bookId?: string;
  onlyOverdue?: boolean;
  sortBy?: 'createdDate' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

// Calls to /loans
export const loansApi = {
  list: (params: LoanListParams) =>
    sendPaginatedApiRequest<LoanResponse>({ method: 'GET', url: '/loans', params }),

  getLoan: (loanId: string) =>
    sendApiRequest<LoanResponse>({ method: 'GET', url: `/loans/${loanId}` }),

  create: (loan: CreateLoanInput) =>
    sendApiRequest<LoanResponse>({ method: 'POST', url: '/loans', data: loan }),

  requestReturn: (loanId: string) =>
    sendApiRequest<LoanResponse>({ method: 'POST', url: `/loans/${loanId}/return-request` }),

  cancelReturnRequest: (loanId: string) =>
    sendApiRequest<LoanResponse>({
      method: 'POST',
      url: `/loans/${loanId}/return-request/cancel`,
    }),

  processReturn: (loanId: string, returnDetails: ProcessLoanReturnInput) =>
    sendApiRequest<LoanResponse>({
      method: 'POST',
      url: `/loans/${loanId}/return`,
      data: returnDetails,
    }),

  cancel: (loanId: string) =>
    sendApiRequest<LoanResponse>({ method: 'POST', url: `/loans/${loanId}/cancel` }),
};
