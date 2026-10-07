import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { loanService } from '../services/loan.service.ts';
import type { LoanListQueryInput } from '../types/requests/loan.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

export const loanController = {
  listLoans: catchAsync(async (req: Request, res: Response) => {
    const actingUser = getAuthenticatedUser(req);
    const query = req.query as unknown as LoanListQueryInput;

    const { items, meta } = await loanService.listLoans(
      actingUser,
      query,
      hasPermission(actingUser.role, Permission.LOANS_VIEW_ALL),
    );

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(items, 'Loans retrieved', getStatusText(StatusCodes.OK), meta));
  }),

  getLoan: catchAsync(async (req: Request, res: Response) => {
    const actingUser = getAuthenticatedUser(req);

    const loan = await loanService.getLoan(
      actingUser,
      String(req.params.id),
      hasPermission(actingUser.role, Permission.LOANS_VIEW_ALL),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(loan, 'Loan retrieved'));
  }),

  createLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await loanService.createLoan(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(loan, 'Loan created', getStatusText(StatusCodes.CREATED)));
  }),

  requestReturn: catchAsync(async (req: Request, res: Response) => {
    const loan = await loanService.requestReturn(getAuthenticatedUser(req), String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(loan, 'Return requested'));
  }),

  cancelReturnRequest: catchAsync(async (req: Request, res: Response) => {
    const loan = await loanService.cancelReturnRequest(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(loan, 'Return request cancelled'));
  }),

  processReturn: catchAsync(async (req: Request, res: Response) => {
    const loan = await loanService.processReturn(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(loan, 'Return processed'));
  }),

  cancelLoan: catchAsync(async (req: Request, res: Response) => {
    const loan = await loanService.cancelLoan(getAuthenticatedUser(req), String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(loan, 'Loan cancelled'));
  }),
};
