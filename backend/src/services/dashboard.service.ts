import { CopyStatus, LoanStatus, Role } from '@prisma/client';
import { DashboardKind, SystemSettingKey } from '@library/shared';
import {
  DASHBOARD_LOAN_LIST_SIZE,
  DASHBOARD_RECENT_AUDIT_ENTRIES,
} from '../constants/dashboard.ts';
import { auditLogRepository } from '../repositories/audit-log.repository.ts';
import { bookCopyRepository } from '../repositories/book-copy.repository.ts';
import { bookRepository } from '../repositories/book.repository.ts';
import { loanRepository } from '../repositories/loan.repository.ts';
import { memberRepository } from '../repositories/member.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { systemSettingService } from './system-setting.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type {
  AdminDashboardRecord,
  DashboardRecord,
  MemberDashboardRecord,
  StaffDashboardRecord,
} from '../types/responses/dashboard.response.types.ts';
import { buildCountByKey } from '../utils/dashboard/build-count-by-key.ts';
import { getStartOfDay } from '../utils/dates/get-start-of-day.ts';
import { toDashboardAuditEntry } from '../utils/mappers/to-dashboard-audit-entry.ts';
import { toLoanResponse } from '../utils/mappers/to-loan-response.ts';

// The member's own loans and how close they are to the loan limit
const buildMemberDashboard = async (
  actingUser: AuthenticatedUser,
): Promise<MemberDashboardRecord> => {
  const maxActiveLoans = await systemSettingService.getSettingValue(
    SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER,
  );

  if (!actingUser.memberId) {
    return {
      kind: DashboardKind.MEMBER,
      statistics: { openLoans: 0, overdueLoans: 0, pendingReturns: 0, maxActiveLoans },
      openLoans: [],
    };
  }

  const [statistics, openLoans] = await Promise.all([
    loanRepository.countMemberStatistics(actingUser.memberId, new Date()),
    loanRepository.findOpenLoansOfMember(actingUser.memberId),
  ]);

  return {
    kind: DashboardKind.MEMBER,
    statistics: { ...statistics, maxActiveLoans },
    openLoans: openLoans.map(toLoanResponse),
  };
};

// The desk's work: loan counts, the most overdue loans and the oldest return requests
const buildStaffDashboard = async (): Promise<StaffDashboardRecord> => {
  const now = new Date();

  const shortListPage = { skip: 0, take: DASHBOARD_LOAN_LIST_SIZE };

  const [statistics, overdueLoansPage, pendingReturnsPage] = await Promise.all([
    loanRepository.countLibraryStatistics(now, getStartOfDay(now)),
    loanRepository.findPage({
      ...shortListPage,
      onlyOverdue: true,
      sortBy: 'dueDate',
      sortOrder: 'asc',
    }),
    loanRepository.findPage({
      ...shortListPage,
      status: LoanStatus.RETURN_REQUESTED,
      sortBy: 'dueDate',
      sortOrder: 'asc',
    }),
  ]);

  return {
    kind: DashboardKind.STAFF,
    statistics,
    overdueLoans: overdueLoansPage.loans.map(toLoanResponse),
    pendingReturnLoans: pendingReturnsPage.loans.map(toLoanResponse),
  };
};

// Everything the desk sees, plus library totals and the newest audit entries
const buildAdminDashboard = async (): Promise<AdminDashboardRecord> => {
  const [
    staffDashboard,
    activeUsersByRole,
    activeBooks,
    activeMembers,
    copiesByStatus,
    recentAuditEntries,
  ] = await Promise.all([
    buildStaffDashboard(),
    userRepository.countActiveByRole(),
    bookRepository.countActive(),
    memberRepository.countActive(),
    bookCopyRepository.countByStatus(),
    auditLogRepository.findRecent(DASHBOARD_RECENT_AUDIT_ENTRIES),
  ]);

  return {
    ...staffDashboard,
    kind: DashboardKind.ADMIN,
    totals: {
      activeUsersByRole: buildCountByKey(
        Object.values(Role),
        activeUsersByRole.map(({ role, count }) => ({ key: role, count })),
      ),
      activeBooks,
      activeMembers,
      copiesByStatus: buildCountByKey(
        Object.values(CopyStatus),
        copiesByStatus.map(({ status, count }) => ({ key: status, count })),
      ),
    },
    recentAuditEntries: recentAuditEntries.map(toDashboardAuditEntry),
  };
};

export const dashboardService = {
  // The dashboard of the user's role (viewers have none; the route blocks them)
  async getDashboard(actingUser: AuthenticatedUser): Promise<DashboardRecord> {
    if (actingUser.role === Role.ADMIN) {
      return buildAdminDashboard();
    }

    if (actingUser.role === Role.LIBRARIAN) {
      return buildStaffDashboard();
    }

    return buildMemberDashboard(actingUser);
  },
};
