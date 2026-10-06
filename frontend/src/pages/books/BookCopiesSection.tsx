import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { CopyStatus, settableCopyStatuses, type BookCopyResponse } from '@library/shared';
import { CopyStatusChip } from '../../components/books/CopyStatusChip';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { formatDateTime } from '../../utils/format-date-time';
import { useBookCopiesSection } from './hooks/useBookCopiesSection';

const { books: texts } = HebrewTexts;

type BookCopiesSectionProps = {
  bookId: string;
  copies: BookCopyResponse[];
};

// Staff only: the book's physical copies, adding a copy and changing a copy's status
export function BookCopiesSection({ bookId, copies }: BookCopiesSectionProps) {
  const copiesSection = useBookCopiesSection(bookId);

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
        >
          {texts.copiesTitle}
        </Typography>

        <Box
          component="form"
          onSubmit={copiesSection.submitNewCopy}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <TextField
            value={copiesSection.newCopyBarcode}
            onChange={(event) => copiesSection.changeNewCopyBarcode(event.target.value)}
            label={texts.newCopyBarcode}
            error={Boolean(copiesSection.barcodeErrorMessage)}
            helperText={copiesSection.barcodeErrorMessage}
            fullWidth={false}
            sx={{
              minWidth: 220,
            }}
          />

          <Button
            type="submit"
            variant="outlined"
            startIcon={<AddIcon />}
            loading={copiesSection.isAddingCopy}
          >
            {texts.addCopy}
          </Button>
        </Box>

        {copies.length === 0 ? (
          <Typography color="text.secondary">{texts.noCopies}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{texts.barcodeColumn}</TableCell>

                  <TableCell>{texts.copyStatusColumn}</TableCell>

                  <TableCell>{texts.acquisitionDateColumn}</TableCell>

                  <TableCell>{texts.changeStatusColumn}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {copies.map((copy) => (
                  <TableRow key={copy.id}>
                    <TableCell>{copy.barcode}</TableCell>

                    <TableCell>
                      <CopyStatusChip status={copy.status} />
                    </TableCell>

                    <TableCell>{formatDateTime(copy.acquisitionDate)}</TableCell>

                    <TableCell>
                      {copy.status === CopyStatus.ON_LOAN ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {texts.copyOnLoanHint}
                        </Typography>
                      ) : (
                        <TextField
                          select
                          value=""
                          onChange={(event) =>
                            copiesSection.changeCopyStatus(
                              copy.id,
                              event.target.value as CopyStatus,
                            )
                          }
                          disabled={copiesSection.isChangingStatus}
                          label={texts.changeStatusColumn}
                          fullWidth={false}
                          sx={{
                            minWidth: 150,
                          }}
                        >
                          {settableCopyStatuses
                            .filter((status) => status !== copy.status)
                            .map((status) => (
                              <MenuItem
                                key={status}
                                value={status}
                              >
                                {HebrewTexts.copyStatuses[status]}
                              </MenuItem>
                            ))}
                        </TextField>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
