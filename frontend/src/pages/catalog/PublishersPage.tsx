import {
  Permission,
  publisherDetailsSchema,
  type PublisherDetailsInput,
  type PublisherResponse,
} from '@library/shared';
import { CatalogReferenceListPage } from '../../components/catalog-reference/CatalogReferenceListPage';
import type { CatalogReferencePageConfig } from '../../components/catalog-reference/catalog-reference-page-config.types';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { QueryKeys } from '../../constants/query-keys';
import { publishersApi } from '../../services/catalog-reference.api';
import { truncateText } from '../../utils/truncate-text';

const { catalog } = HebrewTexts;

// Everything the shared list page needs to show and edit publishers
const publishersPageConfig: CatalogReferencePageConfig<PublisherResponse, PublisherDetailsInput> = {
  title: catalog.publishersTitle,
  queryKey: QueryKeys.PUBLISHERS,
  api: publishersApi,
  managePermission: Permission.PUBLISHERS_MANAGE,
  columns: [
    { header: catalog.nameColumn, renderCell: (publisher) => publisher.name },
    {
      header: catalog.descriptionColumn,
      renderCell: (publisher) => truncateText(publisher.description),
    },
  ],
  formFields: [
    { name: 'name', label: catalog.publisherNameField },
    { name: 'description', label: catalog.descriptionColumn, multiline: true },
  ],
  formSchema: publisherDetailsSchema,
  emptyFormValues: { name: '', description: '' },
  toFormValues: (publisher) => ({
    name: publisher.name,
    description: publisher.description ?? '',
  }),
  getRecordName: (publisher) => publisher.name,
  texts: {
    addButton: catalog.addPublisher,
    createDialogTitle: catalog.createPublisherTitle,
    editDialogTitle: catalog.editPublisherTitle,
    created: catalog.publisherCreated,
    updated: catalog.publisherUpdated,
    disabled: catalog.publisherDisabled,
    reactivated: catalog.publisherReactivated,
    emptyList: catalog.noPublishers,
    duplicateName: catalog.duplicatePublisherName,
  },
};

export function PublishersPage() {
  return <CatalogReferenceListPage config={publishersPageConfig} />;
}
