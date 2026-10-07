import { logger } from '../logger/logger.ts';
import { loanService } from '../services/loan.service.ts';

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

// Marks overdue loans once at startup and then every hour. Returns a function that stops it.
export const startOverdueLoansJob = (): (() => void) => {
  const markOverdueLoans = async () => {
    try {
      const markedLoansCount = await loanService.markOverdueLoans();

      if (markedLoansCount > 0) {
        logger.info({ markedLoansCount }, 'Marked loans as overdue');
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to mark overdue loans');
    }
  };

  void markOverdueLoans();

  const timer = setInterval(markOverdueLoans, ONE_HOUR_IN_MILLISECONDS);

  // The timer alone must not keep the process alive
  timer.unref();

  return () => clearInterval(timer);
};
