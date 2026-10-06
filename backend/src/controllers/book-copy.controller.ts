import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { bookCopyService } from '../services/book-copy.service.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

export const bookCopyController = {
  addCopy: catchAsync(async (req: Request, res: Response) => {
    const copy = await bookCopyService.addCopy(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(copy, 'Book copy created', getStatusText(StatusCodes.CREATED)));
  }),

  changeCopyStatus: catchAsync(async (req: Request, res: Response) => {
    const copy = await bookCopyService.changeCopyStatus(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(copy, 'Book copy status changed'));
  }),
};
