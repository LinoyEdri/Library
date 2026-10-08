import type { ActionType } from '../enums/action-type.enum.js';
import type { CopyStatus } from '../enums/copy-status.enum.js';
import type { EntityType } from '../enums/entity-type.enum.js';
import type { Role } from '../enums/role.enum.js';
import type { LoanResponse } from './loan-response.types.js';

// Which dashboard the payload is: a member's own, the desk (librarian) or the admin's
export const DashboardKind = {
  MEMBER: 'member',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

export type DashboardKind = (typeof DashboardKind)[keyof typeof DashboardKind];

// The member's own loans in numbers (open = active, overdue or waiting for return)
export interface MemberLoanStatistics {
  openLoans: number;
  overdueLoans: number;
  pendingReturns: number;
  maxActiveLoans: number;
}

// The whole library's loans in numbers; "today" counts from local midnight
export interface LibraryLoanStatistics {
  openLoans: number;
  overdueLoans: number;
  pendingReturns: number;
  loansCreatedToday: number;
  returnsProcessedToday: number;
}

// Admin totals: active accounts per role, active books and members, copies per status
export interface LibraryTotals {
  activeUsersByRole: Record<Role, number>;
  activeBooks: number;
  activeMembers: number;
  copiesByStatus: Record<CopyStatus, number>;
}

// One recent audit log line for the admin dashboard. Dates are ISO strings.
export interface DashboardAuditEntry {
  id: string;
  actionType: ActionType;
  affectedType: EntityType;
  affectedRecordId: string | null;
  createdDate: string;
  actionUserRole: Role;
  actionUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MemberDashboardResponse {
  kind: typeof DashboardKind.MEMBER;
  statistics: MemberLoanStatistics;
  openLoans: LoanResponse[];
}

export interface StaffDashboardResponse {
  kind: typeof DashboardKind.STAFF;
  statistics: LibraryLoanStatistics;
  overdueLoans: LoanResponse[];
  pendingReturnLoans: LoanResponse[];
}

export interface AdminDashboardResponse extends Omit<StaffDashboardResponse, 'kind'> {
  kind: typeof DashboardKind.ADMIN;
  totals: LibraryTotals;
  recentAuditEntries: DashboardAuditEntry[];
}

// GET /dashboard returns the dashboard of the logged-in user's role
export type DashboardResponse =
  MemberDashboardResponse | StaffDashboardResponse | AdminDashboardResponse;
