// Every setting the system knows. Admins edit their values; they cannot add new keys.
export const SystemSettingKey = {
  LOAN_PERIOD_DAYS: 'loanPeriodDays',
  MAX_ACTIVE_LOANS_PER_MEMBER: 'maxActiveLoansPerMember',
} as const;

export type SystemSettingKey = (typeof SystemSettingKey)[keyof typeof SystemSettingKey];
