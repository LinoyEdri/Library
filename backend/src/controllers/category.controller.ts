import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { categoryService } from '../services/category.service.ts';
import type { NamedRecordListQueryInput } from '../types/requests/catalog-reference.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

// Only users who manage categories may see disabled ones
const canSeeDisabledCategories = (req: Request): boolean =>
  hasPermission(getAuthenticatedUser(req).role, Permission.CATEGORIES_MANAGE);

export const categoryController = {
  listCategories: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as NamedRecordListQueryInput;

    const { items, meta } = await categoryService.listCategories(
      query,
      canSeeDisabledCategories(req),
    );

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(items, 'Categories retrieved', getStatusText(StatusCodes.OK), meta),
      );
  }),

  getCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.getCategory(
      String(req.params.id),
      canSeeDisabledCategories(req),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(category, 'Category retrieved'));
  }),

  createCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(category, 'Category created', getStatusText(StatusCodes.CREATED)));
  }),

  updateCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(category, 'Category updated'));
  }),

  disableCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.disableCategory(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(category, 'Category disabled'));
  }),

  reactivateCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.reactivateCategory(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(category, 'Category reactivated'));
  }),
};
