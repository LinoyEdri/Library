import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import { RecordStatus } from '@library/shared';
import { HebrewTexts } from '../../constants/hebrew-texts';

type CatalogReferenceRowActionsProps = {
  status: RecordStatus;
  onEdit: () => void;
  onDisable: () => void;
  onReactivate: () => void;
};

// Edit plus disable (active records) or reactivate (disabled records)
export function CatalogReferenceRowActions({
  status,
  onEdit,
  onDisable,
  onReactivate,
}: CatalogReferenceRowActionsProps) {
  return (
    <>
      <Tooltip title={HebrewTexts.common.edit}>
        <IconButton
          size="small"
          aria-label={HebrewTexts.common.edit}
          onClick={onEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {status === RecordStatus.ACTIVE ? (
        <Tooltip title={HebrewTexts.common.disable}>
          <IconButton
            size="small"
            color="error"
            aria-label={HebrewTexts.common.disable}
            onClick={onDisable}
          >
            <BlockIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={HebrewTexts.common.reactivate}>
          <IconButton
            size="small"
            color="secondary"
            aria-label={HebrewTexts.common.reactivate}
            onClick={onReactivate}
          >
            <RestoreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
