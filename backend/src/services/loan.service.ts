import { ActionType, CopyStatus, EntityType, LoanStatus, RecordStatus, Role } from '@prisma/client';
import { BusinessErrorCode, SystemSettingKey } from '@library/shared';
import {
  OPEN_LOAN_STATUSES,
  RETURN_REQUESTABLE_LOAN_STATUSES,
} from '../constants/loan-statuses.ts';
import { runInDatabaseTransaction } from '../prisma/run-in-database-transaction.ts';
import { bookCopyRepository } from '../repositories/book-copy.repository.ts';
import { bookRepository } from '../repositories/book.repository.ts';
import { loanRepository } from '../repositories/loan.repository.ts';
import { memberRepository } from '../repositories/member.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { auditLogService } from './audit-log.service.ts';
import { systemSettingService } from './system-setting.service.ts';
import type { AuthenticatedUser } from '../types/authentication/authenticated-user.types.ts';
import type { LoanWithDetails } from '../types/database/loan-with-details.types.ts';
import type {
  CreateLoanInput,
  LoanListQueryInput,
  ProcessLoanReturnInput,
} from '../types/requests/loan.requests.types.ts';
import type { LoanRecordResponse } from '../types/responses/loan.response.types.ts';
import type { PaginatedResult } from '../types/responses/paginated-result.response.types.ts';
import { BusinessRuleError } from '../types/errors/BusinessRuleError.ts';
import { ForbiddenError } from '../types/errors/ForbiddenError.ts';
import { NotFoundError } from '../types/errors/NotFoundError.ts';
import { calculateDueDate } from '../utils/loans/calculate-due-date.ts';
import { resolveStatusAfterRequestCancel } from '../utils/loans/resolve-status-after-request-cancel.ts';
import { toLoanResponse } from '../utils/mappers/to-loan-response.ts';
import { buildPaginationMeta } from '../utils/pagination/build-pagination-meta.ts';
import { toPageRequest } from '../utils/pagination/to-page-request.ts';

// Audit action for a copy that comes back damaged or lost
const copyConditionAuditAction: Partial<Record<CopyStatus, ActionType>> = {
  [CopyStatus.DAMAGED]: ActionType.BOOK_COPY_MARKED_DAMAGED,
  [CopyStatus.LOST]: ActionType.BOOK_COPY_MARKED_LOST,
};

const findLoanOrThrow = async (loanId: string): Promise<LoanWithDetails> => {
  const loan = await loanRepository.findById(loanId);

  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  return loan;
};

// Members may act only on their own loans
const assertOwnLoan = (actingUser: AuthenticatedUser, loan: LoanWithDetails) => {
  if (actingUser.memberId !== loan.memberId) {
    throw new ForbiddenError('Members can only access their own loans');
  }
};

// The action is allowed only while the loan has one of these statuses
const assertLoanStatus = (loan: LoanWithDetails, allowedStatuses: LoanStatus[]) => {
  if (!allowedStatuses.includes(loan.status)) {
    throw new BusinessRuleError(
      BusinessErrorCode.LOAN_STATUS_NOT_ALLOWED,
      `This action is not allowed for a loan with status ${loan.status}`,
    );
  }
};

// The member must exist and both the membership and the account must be active
const findActiveMemberOrThrow = async (memberId: string) => {
  const member = await memberRepository.findById(memberId);

  if (!member) {
    throw new NotFoundError('Member not found');
  }

  if (member.status !== RecordStatus.ACTIVE || member.user.status !== RecordStatus.ACTIVE) {
    throw new BusinessRuleError(BusinessErrorCode.MEMBER_NOT_ACTIVE, 'The member is not active');
  }

  return member;
};

// Resolves which book is loaned: from the barcode's copy, or the chosen book
const resolveLoanTarget = async ({ bookId, barcode }: CreateLoanInput) => {
  if (!barcode) {
    return { bookId: bookId ?? '', requestedCopyId: null };
  }

  const copy = await bookCopyRepository.findByBarcode(barcode);

  if (!copy) {
    throw new BusinessRuleError(BusinessErrorCode.COPY_NOT_FOUND, 'No copy has this barcode');
  }

  if (bookId && copy.bookId !== bookId) {
    throw new BusinessRuleError(
      BusinessErrorCode.COPY_OF_OTHER_BOOK,
      'The barcode belongs to a copy of a different book',
    );
  }

  return { bookId: copy.bookId, requestedCopyId: copy.id };
};

export const loanService = {
  // Staff see every loan; members always get only their own
  async listLoans(
    actingUser: AuthenticatedUser,
    query: LoanListQueryInput,
    canViewAllLoans: boolean,
  ): Promise<PaginatedResult<LoanRecordResponse>> {
    const { loans, totalItems } = await loanRepository.findPage({
      ...toPageRequest(query.page, query.pageSize),
      search: query.search,
      status: query.status,
      memberId: canViewAllLoans ? query.memberId : (actingUser.memberId ?? 'no-membership'),
      bookId: query.bookId,
      onlyOverdue: query.onlyOverdue,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: loans.map(toLoanResponse),
      meta: buildPaginationMeta(query.page, query.pageSize, totalItems),
    };
  },

  async getLoan(
    actingUser: AuthenticatedUser,
    loanId: string,
    canViewAllLoans: boolean,
  ): Promise<LoanRecordResponse> {
    const loan = await findLoanOrThrow(loanId);

    if (!canViewAllLoans) {
      assertOwnLoan(actingUser, loan);
    }

    return toLoanResponse(loan);
  },

  // Active member + active book + a free copy, within the member's loan limit, all in one transaction
  async createLoan(
    actingUser: AuthenticatedUser,
    input: CreateLoanInput,
  ): Promise<LoanRecordResponse> {
    const member = await findActiveMemberOrThrow(input.memberId);

    const { bookId, requestedCopyId } = await resolveLoanTarget(input);

    const book = await bookRepository.findById(bookId);

    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.status !== RecordStatus.ACTIVE) {
      throw new BusinessRuleError(
        BusinessErrorCode.BOOK_NOT_ACTIVE,
        'Disabled books cannot be loaned',
      );
    }

    const loanPeriodDays = await systemSettingService.getSettingValue(
      SystemSettingKey.LOAN_PERIOD_DAYS,
    );

    const maxActiveLoans = await systemSettingService.getSettingValue(
      SystemSettingKey.MAX_ACTIVE_LOANS_PER_MEMBER,
    );

    const createdLoan = await runInDatabaseTransaction(async (transactionClient) => {
      const openLoansCount = await loanRepository.countOpenLoansForMember(
        member.id,
        transactionClient,
      );

      if (openLoansCount >= maxActiveLoans) {
        throw new BusinessRuleError(
          BusinessErrorCode.LOAN_LIMIT_REACHED,
          `The member already holds ${openLoansCount} loans (limit ${maxActiveLoans})`,
        );
      }

      const copyId =
        requestedCopyId ??
        (await bookCopyRepository.findFirstAvailableCopyOfBook(bookId, transactionClient))?.id;

      if (!copyId) {
        throw new BusinessRuleError(
          BusinessErrorCode.NO_AVAILABLE_COPY,
          'No copy of this book is available',
        );
      }

      // Guarded flip: fails if the copy is not available (or was just taken by another loan)
      if (!(await bookCopyRepository.reserveCopyIfAvailable(copyId, transactionClient))) {
        throw new BusinessRuleError(
          requestedCopyId
            ? BusinessErrorCode.COPY_NOT_AVAILABLE
            : BusinessErrorCode.NO_AVAILABLE_COPY,
          'The copy is not available',
        );
      }

      const now = new Date();

      const loan = await loanRepository.create(
        {
          memberId: member.id,
          bookCopyId: copyId,
          createdByUserId: actingUser.id,
          createdDate: now,
          dueDate: calculateDueDate(now, loanPeriodDays),
        },
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.LOAN_CREATED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.LOAN,
          affectedRecordId: loan.id,
          newValue: {
            memberId: member.id,
            bookId,
            copyId,
            barcode: loan.bookCopy.barcode,
            dueDate: loan.dueDate,
          },
        },
        transactionClient,
      );

      return loan;
    });

    return toLoanResponse(createdLoan);
  },

  // A member asks to return their own active or overdue loan
  async requestReturn(actingUser: AuthenticatedUser, loanId: string): Promise<LoanRecordResponse> {
    const loan = await findLoanOrThrow(loanId);

    assertOwnLoan(actingUser, loan);
    assertLoanStatus(loan, RETURN_REQUESTABLE_LOAN_STATUSES);

    const updatedLoan = await runInDatabaseTransaction(async (transactionClient) => {
      const changedLoan = await loanRepository.update(
        loanId,
        { status: LoanStatus.RETURN_REQUESTED, returnRequestedDate: new Date() },
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.LOAN_RETURN_REQUESTED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.LOAN,
          affectedRecordId: loanId,
          previousValue: { status: loan.status },
          newValue: { status: changedLoan.status },
        },
        transactionClient,
      );

      return changedLoan;
    });

    return toLoanResponse(updatedLoan);
  },

  // The member withdraws their return request; the loan is active again (or overdue if late)
  async cancelReturnRequest(
    actingUser: AuthenticatedUser,
    loanId: string,
  ): Promise<LoanRecordResponse> {
    const loan = await findLoanOrThrow(loanId);

    assertOwnLoan(actingUser, loan);
    assertLoanStatus(loan, [LoanStatus.RETURN_REQUESTED]);

    const updatedLoan = await runInDatabaseTransaction(async (transactionClient) => {
      const changedLoan = await loanRepository.update(
        loanId,
        {
          status: resolveStatusAfterRequestCancel(loan.dueDate),
          returnRequestCancelledDate: new Date(),
        },
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.LOAN_RETURN_REQUEST_CANCELLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.LOAN,
          affectedRecordId: loanId,
          previousValue: { status: loan.status },
          newValue: { status: changedLoan.status },
        },
        transactionClient,
      );

      return changedLoan;
    });

    return toLoanResponse(updatedLoan);
  },

  // Staff confirm the physical return; the copy becomes available, damaged or lost
  async processReturn(
    actingUser: AuthenticatedUser,
    loanId: string,
    { copyCondition }: ProcessLoanReturnInput,
  ): Promise<LoanRecordResponse> {
    const loan = await findLoanOrThrow(loanId);

    assertLoanStatus(loan, OPEN_LOAN_STATUSES);

    await runInDatabaseTransaction(async (transactionClient) => {
      const now = new Date();

      await loanRepository.update(
        loanId,
        {
          status: LoanStatus.RETURNED,
          returnDate: now,
          returnProcessedDate: now,
          returnProcessedByUserId: actingUser.id,
        },
        transactionClient,
      );

      await bookCopyRepository.updateStatus(
        loan.bookCopyId,
        { status: copyCondition, disabledDate: null, disabledByUserId: null },
        transactionClient,
      );

      const auditBase = {
        actionUserId: actingUser.id,
        actionUserRole: actingUser.role,
      };

      await auditLogService.recordAuditLogEntry(
        {
          ...auditBase,
          actionType: ActionType.LOAN_RETURN_PROCESSED,
          affectedType: EntityType.LOAN,
          affectedRecordId: loanId,
          previousValue: { status: loan.status },
          newValue: { status: LoanStatus.RETURNED },
          additionalContext: { copyCondition },
        },
        transactionClient,
      );

      const copyAuditAction = copyConditionAuditAction[copyCondition];

      if (copyAuditAction) {
        await auditLogService.recordAuditLogEntry(
          {
            ...auditBase,
            actionType: copyAuditAction,
            affectedType: EntityType.BOOK_COPY,
            affectedRecordId: loan.bookCopyId,
            previousValue: { status: CopyStatus.ON_LOAN },
            newValue: { status: copyCondition },
            additionalContext: { loanId },
          },
          transactionClient,
        );
      }
    });

    return toLoanResponse(await findLoanOrThrow(loanId));
  },

  // Staff cancel a loan made by mistake; the copy goes back on the shelf
  async cancelLoan(actingUser: AuthenticatedUser, loanId: string): Promise<LoanRecordResponse> {
    const loan = await findLoanOrThrow(loanId);

    assertLoanStatus(loan, OPEN_LOAN_STATUSES);

    await runInDatabaseTransaction(async (transactionClient) => {
      await loanRepository.update(loanId, { status: LoanStatus.CANCELLED }, transactionClient);

      await bookCopyRepository.updateStatus(
        loan.bookCopyId,
        { status: CopyStatus.AVAILABLE, disabledDate: null, disabledByUserId: null },
        transactionClient,
      );

      await auditLogService.recordAuditLogEntry(
        {
          actionType: ActionType.LOAN_CANCELLED,
          actionUserId: actingUser.id,
          actionUserRole: actingUser.role,
          affectedType: EntityType.LOAN,
          affectedRecordId: loanId,
          previousValue: { status: loan.status },
          newValue: { status: LoanStatus.CANCELLED },
        },
        transactionClient,
      );
    });

    return toLoanResponse(await findLoanOrThrow(loanId));
  },

  // System job: ACTIVE loans past their due date become OVERDUE (audited in the first admin's name)
  async markOverdueLoans(now: Date = new Date()): Promise<number> {
    const pastDueLoans = await loanRepository.findActiveLoansPastDue(now);

    if (pastDueLoans.length === 0) {
      return 0;
    }

    const systemActor = await userRepository.findFirstActiveAdmin();

    for (const pastDueLoan of pastDueLoans) {
      await runInDatabaseTransaction(async (transactionClient) => {
        await loanRepository.update(
          pastDueLoan.id,
          { status: LoanStatus.OVERDUE },
          transactionClient,
        );

        if (systemActor) {
          await auditLogService.recordAuditLogEntry(
            {
              actionType: ActionType.LOAN_MARKED_OVERDUE,
              actionUserId: systemActor.id,
              actionUserRole: Role.ADMIN,
              affectedType: EntityType.LOAN,
              affectedRecordId: pastDueLoan.id,
              previousValue: { status: LoanStatus.ACTIVE },
              newValue: { status: LoanStatus.OVERDUE },
              additionalContext: { source: 'SYSTEM_JOB', dueDate: pastDueLoan.dueDate },
            },
            transactionClient,
          );
        }
      });
    }

    return pastDueLoans.length;
  },
};
