import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { Permission, RecordStatus } from '@library/shared';
import type { CatalogReferenceApi } from '../../services/create-catalog-reference-api';

// Minimum shape of a catalog record (author, publisher, category)
export interface CatalogReferenceRecord {
  id: string;
  status: RecordStatus;
}

// Form values are always text; the shared schema converts them (e.g. empty biography -> null)
export type CatalogReferenceFormValues = Record<string, string>;

export interface CatalogReferenceColumn<RecordResponse> {
  header: string;
  renderCell: (record: RecordResponse) => ReactNode;
}

export interface CatalogReferenceFormField {
  name: string;
  label: string;
  multiline?: boolean;
}

// Everything that differs between the authors, publishers and categories pages
export interface CatalogReferencePageConfig<
  RecordResponse extends CatalogReferenceRecord,
  Details,
> {
  title: string;
  queryKey: readonly string[];
  api: CatalogReferenceApi<RecordResponse, Details>;
  managePermission: Permission;
  columns: CatalogReferenceColumn<RecordResponse>[];
  formFields: CatalogReferenceFormField[];
  formSchema: z.ZodType<Details>;
  emptyFormValues: CatalogReferenceFormValues;
  toFormValues: (record: RecordResponse) => CatalogReferenceFormValues;
  getRecordName: (record: RecordResponse) => string;
  texts: {
    addButton: string;
    createDialogTitle: string;
    editDialogTitle: string;
    created: string;
    updated: string;
    disabled: string;
    reactivated: string;
    emptyList: string;
    duplicateName?: string;
  };
}
