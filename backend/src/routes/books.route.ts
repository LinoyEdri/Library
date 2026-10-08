import { Router } from 'express';
import {
  addBookCopySchema,
  bookDetailsSchema,
  bookListQuerySchema,
  Permission,
  recordIdParamsSchema,
} from '@library/shared';
import { bookCopyController } from '../controllers/book-copy.controller.ts';
import { bookController } from '../controllers/book.controller.ts';
import { authorizePermission } from '../middlewares/auth/authorize-permission.middleware.ts';
import { requireAuthentication } from '../middlewares/auth/require-authentication.middleware.ts';
import { validate } from '../middlewares/validation/validate.middleware.ts';
import { RequestLocation } from '../types/http/request-location.types.ts';

const booksRouter = Router();

// Every book endpoint needs a logged-in user
booksRouter.use(requireAuthentication);

booksRouter.get(
  '/',
  authorizePermission(Permission.BOOKS_VIEW),
  validate(RequestLocation.QUERY, bookListQuerySchema),
  bookController.listBooks,
);

// Declared before "/:id" so "languages" is not read as a book id
booksRouter.get(
  '/languages',
  authorizePermission(Permission.BOOKS_VIEW),
  bookController.listLanguages,
);

booksRouter.get(
  '/:id',
  authorizePermission(Permission.BOOKS_VIEW),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  bookController.getBook,
);

booksRouter.post(
  '/',
  authorizePermission(Permission.BOOKS_CREATE),
  validate(RequestLocation.BODY, bookDetailsSchema),
  bookController.createBook,
);

booksRouter.patch(
  '/:id',
  authorizePermission(Permission.BOOKS_UPDATE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, bookDetailsSchema),
  bookController.updateBook,
);

booksRouter.post(
  '/:id/disable',
  authorizePermission(Permission.BOOKS_DISABLE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  bookController.disableBook,
);

booksRouter.post(
  '/:id/reactivate',
  authorizePermission(Permission.BOOKS_DISABLE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  bookController.reactivateBook,
);

booksRouter.post(
  '/:id/copies',
  authorizePermission(Permission.BOOK_COPIES_MANAGE),
  validate(RequestLocation.PARAMS, recordIdParamsSchema),
  validate(RequestLocation.BODY, addBookCopySchema),
  bookCopyController.addCopy,
);

export default booksRouter;
