import {
  authorDetailsSchema,
  Permission,
  type AuthorDetailsInput,
  type AuthorResponse,
} from '@library/shared';
import { CatalogReferenceListPage } from '../../components/catalog-reference/CatalogReferenceListPage';
import type { CatalogReferencePageConfig } from '../../components/catalog-reference/catalog-reference-page-config.types';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { QueryKeys } from '../../constants/query-keys';
import { authorsApi } from '../../services/catalog-reference.api';
import { truncateText } from '../../utils/truncate-text';

const { catalog } = HebrewTexts;

// Everything the shared list page needs to show and edit authors
const authorsPageConfig: CatalogReferencePageConfig<AuthorResponse, AuthorDetailsInput> = {
  title: catalog.authorsTitle,
  queryKey: QueryKeys.AUTHORS,
  api: authorsApi,
  managePermission: Permission.AUTHORS_MANAGE,
  columns: [
    { header: catalog.firstNameColumn, renderCell: (author) => author.firstName },
    { header: catalog.lastNameColumn, renderCell: (author) => author.lastName },
    { header: catalog.biographyColumn, renderCell: (author) => truncateText(author.biography) },
  ],
  formFields: [
    { name: 'firstName', label: HebrewTexts.fields.firstName },
    { name: 'lastName', label: HebrewTexts.fields.lastName },
    { name: 'biography', label: catalog.biographyColumn, multiline: true },
  ],
  formSchema: authorDetailsSchema,
  emptyFormValues: { firstName: '', lastName: '', biography: '' },
  toFormValues: (author) => ({
    firstName: author.firstName,
    lastName: author.lastName,
    biography: author.biography ?? '',
  }),
  getRecordName: (author) => `${author.firstName} ${author.lastName}`,
  texts: {
    addButton: catalog.addAuthor,
    createDialogTitle: catalog.createAuthorTitle,
    editDialogTitle: catalog.editAuthorTitle,
    created: catalog.authorCreated,
    updated: catalog.authorUpdated,
    disabled: catalog.authorDisabled,
    reactivated: catalog.authorReactivated,
    emptyList: catalog.noAuthors,
  },
};

export function AuthorsPage() {
  return <CatalogReferenceListPage config={authorsPageConfig} />;
}
