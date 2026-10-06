import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { hasPermission, Permission } from '@library/shared';
import { memberService } from '../services/member.service.ts';
import type {
  MemberCandidateQueryInput,
  MemberListQueryInput,
} from '../types/requests/member.requests.types.ts';
import { getAuthenticatedUser } from '../utils/authentication/get-authenticated-user.ts';
import { ApiResponse } from '../utils/http/api-response.ts';
import { catchAsync } from '../utils/http/catch-async.ts';
import { getStatusText } from '../utils/http/status-text.ts';

export const memberController = {
  listMembers: catchAsync(async (req: Request, res: Response) => {
    const query = req.query as unknown as MemberListQueryInput;

    const { items, meta } = await memberService.listMembers(query);

    res
      .status(StatusCodes.OK)
      .json(ApiResponse.success(items, 'Members retrieved', getStatusText(StatusCodes.OK), meta));
  }),

  listMemberCandidates: catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query as unknown as MemberCandidateQueryInput;

    const candidates = await memberService.listMemberCandidates(search);

    res.status(StatusCodes.OK).json(ApiResponse.success(candidates, 'Member candidates retrieved'));
  }),

  getOwnMember: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.getOwnMember(getAuthenticatedUser(req));

    res.status(StatusCodes.OK).json(ApiResponse.success(member, 'Member retrieved'));
  }),

  getMember: catchAsync(async (req: Request, res: Response) => {
    const actingUser = getAuthenticatedUser(req);

    const member = await memberService.getMember(
      actingUser,
      String(req.params.id),
      hasPermission(actingUser.role, Permission.MEMBERS_VIEW),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(member, 'Member retrieved'));
  }),

  createMember: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.createMember(getAuthenticatedUser(req), req.body);

    res
      .status(StatusCodes.CREATED)
      .json(ApiResponse.success(member, 'Member created', getStatusText(StatusCodes.CREATED)));
  }),

  updateMember: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.updateMember(
      getAuthenticatedUser(req),
      String(req.params.id),
      req.body,
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(member, 'Member updated'));
  }),

  disableMember: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.disableMember(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(member, 'Member disabled'));
  }),

  reactivateMember: catchAsync(async (req: Request, res: Response) => {
    const member = await memberService.reactivateMember(
      getAuthenticatedUser(req),
      String(req.params.id),
    );

    res.status(StatusCodes.OK).json(ApiResponse.success(member, 'Member reactivated'));
  }),
};
