import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { publisherService } from '../services/publisher.service.ts';
import type { NamedRecordListQueryInput } from '../types/requests/catalog-reference.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

// Only users who manage publishers may see disabled ones
const canSeeDisabledPublishers = (req: Request): boolean =>
  hasPermission(getAuthenticatedUser(req).role, Permission.PUBLISHERS_MANAGE);

export const publisherController = {
  listPublishers: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as NamedRecordListQueryInput;

    const { items, meta } = await publisherService.listPublishers(
      query,
      canSeeDisabledPublishers(req),
    );

    res
      .status(StatusCodes.OK)
      .json(
        ApiResponse.success(items, 'Publishers retrieved', getStatusText(StatusCodes.OK), meta),
      );
  }),

  getPublisher: catchAsync(async (req: Request, res: Response) => {
    const publisher = await publisherService.getPublisher(
      String(req.params.id),
      canSeeDisabledPublishers(req),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(publisher, 'Publisher retrieved'));
  }),

  createPublisher: catchAsync(async (req: Request, res: Response) => {
    const publisher = await publisherService.createPublisher(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(
        ApiResponse.success(publisher, 'Publisher created', getStatusText(StatusCodes.CREATED)),
      );
  }),

  updatePublisher: catchAsync(async (req: Request, res: Response) => {
    const publisher = await publisherService.updatePublisher(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(publisher, 'Publisher updated'));
  }),

  disablePublisher: catchAsync(async (req: Request, res: Response) => {
    const publisher = await publisherService.disablePublisher(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(publisher, 'Publisher disabled'));
  }),

  reactivatePublisher: catchAsync(async (req: Request, res: Response) => {
    const publisher = await publisherService.reactivatePublisher(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(publisher, 'Publisher reactivated'));
  }),
};
