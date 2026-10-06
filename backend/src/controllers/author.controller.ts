import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { authorService } from '../services/author.service.ts';
import type { AuthorListQueryInput } from '../types/requests/catalog-reference.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

// Only users who manage authors may see disabled ones
const canSeeDisabledAuthors = (req: Request): boolean =>
  hasPermission(getAuthenticatedUser(req).role, Permission.AUTHORS_MANAGE);

export const authorController = {
  listAuthors: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as AuthorListQueryInput;

    const { items, meta } = await authorService.listAuthors(query, canSeeDisabledAuthors(req));

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(items, 'Authors retrieved', getStatusText(StatusCodes.OK), meta));
  }),

  getAuthor: catchAsync(async (req: Request, res: Response) => {
    const author = await authorService.getAuthor(String(req.params.id), canSeeDisabledAuthors(req));

    res.status(StatusCodes.OK).json(ApiResponse.success(author, 'Author retrieved'));
  }),

  createAuthor: catchAsync(async (req: Request, res: Response) => {
    const author = await authorService.createAuthor(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(author, 'Author created', getStatusText(StatusCodes.CREATED)));
  }),

  updateAuthor: catchAsync(async (req: Request, res: Response) => {
    const author = await authorService.updateAuthor(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(author, 'Author updated'));
  }),

  disableAuthor: catchAsync(async (req: Request, res: Response) => {
    const author = await authorService.disableAuthor(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(author, 'Author disabled'));
  }),

  reactivateAuthor: catchAsync(async (req: Request, res: Response) => {
    const author = await authorService.reactivateAuthor(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(author, 'Author reactivated'));
  }),
};
