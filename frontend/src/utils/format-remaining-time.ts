// 272 seconds -> "4:32"
export const formatRemainingTime = (remainingSeconds: number): string => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
