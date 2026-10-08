import { useEffect, useState } from 'react';
import { formatRemainingTime } from '../utils/format-remaining-time';

const ONE_SECOND_IN_MILLISECONDS = 1000;

// The last minute is shown as "running out"
const RUNNING_OUT_SECONDS = 60;

// Time left until a deadline (ISO date), updated every second
export const useCountdown = (deadline: string) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), ONE_SECOND_IN_MILLISECONDS);

    return () => clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - now) / ONE_SECOND_IN_MILLISECONDS),
  );

  return {
    remainingText: formatRemainingTime(remainingSeconds),
    isExpired: remainingSeconds === 0,
    isRunningOut: remainingSeconds > 0 && remainingSeconds <= RUNNING_OUT_SECONDS,
  };
};
