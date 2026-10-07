import type { ActionType, EntityType, Role } from '@prisma/client';
import type {
  DashboardKind,
  LibraryLoanStatistics,
  LibraryTotals,
  MemberLoanStatistics,
} from '@library/shared';
import type { LoanRecordResponse } from './loan.response.types.ts';

// What the dashboard service returns (Date objects; sent as ISO strings)

export interface DashboardAuditEntryRecord {
  id: string;
  actionType: ActionType;
  affectedType: EntityType;
  affectedRecordId: string | null;
  createdDate: Date;
  actionUserRole: Role;
  actionUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MemberDashboardRecord {
  kind: typeof DashboardKind.MEMBER;
  statistics: MemberLoanStatistics;
  openLoans: LoanRecordResponse[];
}

export interface StaffDashboardRecord {
  kind: typeof DashboardKind.STAFF;
  statistics: LibraryLoanStatistics;
  overdueLoans: LoanRecordResponse[];
  pendingReturnLoans: LoanRecordResponse[];
}

export interface AdminDashboardRecord extends Omit<StaffDashboardRecord, 'kind'> {
  kind: typeof DashboardKind.ADMIN;
  totals: LibraryTotals;
  recentAuditEntries: DashboardAuditEntryRecord[];
}

export type DashboardRecord = MemberDashboardRecord | StaffDashboardRecord | AdminDashboardRecord;
