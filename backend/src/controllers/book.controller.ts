import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { bookService } from '../services/book.service.ts';
import type { BookListQueryInput } from '../types/requests/book.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

// Staff who edit books may also see disabled ones
const canSeeDisabledBooks = (req: Request): boolean =>
  hasPermission(getAuthenticatedUser(req).role, Permission.BOOKS_UPDATE);

// Physical copies are only shown to staff who manage them
const canSeeCopies = (req: Request): boolean =>
  hasPermission(getAuthenticatedUser(req).role, Permission.BOOK_COPIES_MANAGE);

export const bookController = {
  listBooks: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as BookListQueryInput;

    const { items, meta } = await bookService.listBooks(query, canSeeDisabledBooks(req));

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(items, 'Books retrieved', getStatusText(StatusCodes.OK), meta));
  }),

  listLanguages: catchAsync(async (req: Request, res: Response) => {
    const languages = await bookService.listLanguages(canSeeDisabledBooks(req));

    res.status(StatusCodes.OK).json(ApiResponse.success(languages, 'Book languages retrieved'));
  }),

  getBook: catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.getBook(String(req.params.id), {
      canSeeDisabledBooks: canSeeDisabledBooks(req),
      canSeeCopies: canSeeCopies(req),
    });

    res.status(StatusCodes.OK).json(ApiResponse.success(book, 'Book retrieved'));
  }),

  createBook: catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.createBook(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(book, 'Book created', getStatusText(StatusCodes.CREATED)));
  }),

  updateBook: catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.updateBook(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(book, 'Book updated'));
  }),

  disableBook: catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.disableBook(getAuthenticatedUser(req), String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(book, 'Book disabled'));
  }),

  reactivateBook: catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.reactivateBook(getAuthenticatedUser(req), String(req.params.id));

    res.status(StatusCodes.OK).json(ApiResponse.success(book, 'Book reactivated'));
  }),
};
