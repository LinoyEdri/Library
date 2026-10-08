import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';
import { useNotification } from '../../../hooks/useNotification';
import { ApiRequestError } from '../../../services/api-request-error';
import { applyServerFieldErrors } from '../../../utils/apply-server-field-errors';
import { getHebrewErrorMessage } from '../../../utils/get-hebrew-error-message';
import type {
  CatalogReferenceFormValues,
  CatalogReferencePageConfig,
  CatalogReferenceRecord,
} from '../catalog-reference-page-config.types';

type UseCatalogReferenceFormDialogOptions<
  RecordResponse extends CatalogReferenceRecord,
  Details,
> = {
  config: CatalogReferencePageConfig<RecordResponse, Details>;
  // The record being edited, or undefined when creating a new one
  editedRecord?: RecordResponse;
  onClose: () => void;
};

// Create/edit form: validation with the shared schema, save, duplicate-name and server errors
export const useCatalogReferenceFormDialog = <
  RecordResponse extends CatalogReferenceRecord,
  Details,
>({
  config,
  editedRecord,
  onClose,
}: UseCatalogReferenceFormDialogOptions<RecordResponse, Details>) => {
  const queryClient = useQueryClient();

  const { showNotification } = useNotification();

  const { control, handleSubmit, setError } = useForm<CatalogReferenceFormValues, unknown, Details>(
    {
      resolver: zodResolver(
        config.formSchema as unknown as z.ZodType<Details, CatalogReferenceFormValues>,
      ),
      defaultValues: editedRecord ? config.toFormValues(editedRecord) : config.emptyFormValues,
    },
  );

  const saveMutation = useMutation({
    mutationFn: (details: Details) =>
      editedRecord ? config.api.update(editedRecord.id, details) : config.api.create(details),
  });

  const submitForm = handleSubmit(async (details) => {
    try {
      await saveMutation.mutateAsync(details);

      await queryClient.invalidateQueries({ queryKey: config.queryKey });

      showNotification(editedRecord ? config.texts.updated : config.texts.created);

      onClose();
    } catch (error) {
      const isDuplicateName =
        error instanceof ApiRequestError && error.statusCode === StatusCodes.CONFLICT;

      if (isDuplicateName && config.texts.duplicateName) {
        setError('name', { message: config.texts.duplicateName });
        return;
      }

      if (!applyServerFieldErrors(error, setError)) {
        showNotification(getHebrewErrorMessage(error), 'error');
      }
    }
  });

  return {
    control,
    submitForm,
    isSaving: saveMutation.isPending,
    dialogTitle: editedRecord ? config.texts.editDialogTitle : config.texts.createDialogTitle,
  };
};
