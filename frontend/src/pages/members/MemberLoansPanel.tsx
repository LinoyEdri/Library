import { LoanActionDialogs } from '../../components/loans/LoanActionDialogs';
import { LoansTable } from '../../components/loans/LoansTable';
import { useMemberLoansPanel } from './hooks/useMemberLoansPanel';

// "Loans" tab of a member's page
export function MemberLoansPanel({ memberId }: { memberId: string }) {
  const loansPanel = useMemberLoansPanel(memberId);

  return (
    <>
      <LoansTable
        loans={loansPanel.loans}
        totalItems={loansPanel.totalItems}
        isLoading={loansPanel.isLoading}
        pageIndex={loansPanel.paging.pageIndex}
        pageSize={loansPanel.paging.pageSize}
        onPageIndexChange={loansPanel.paging.setPageIndex}
        onPageSizeChange={loansPanel.paging.changePageSize}
        showMemberColumn={false}
        loanActions={loansPanel.loanActions}
        onOpenLoan={loansPanel.openLoan}
      />

      <LoanActionDialogs loanActions={loansPanel.loanActions} />
    </>
  );
}
