import { useState } from 'react';
import { CopyStatus, type ReturnCopyCondition } from '@library/shared';

// The copy condition chosen in the "process return" dialog (an intact copy by default)
export const useProcessReturnDialog = () => {
  const [copyCondition, setCopyCondition] = useState<ReturnCopyCondition>(CopyStatus.AVAILABLE);

  return {
    copyCondition,
    changeCopyCondition: setCopyCondition,
  };
};
