import {
  categoryDetailsSchema,
  Permission,
  type CategoryDetailsInput,
  type CategoryResponse,
} from '@library/shared';
import { CatalogReferenceListPage } from '../../components/catalog-reference/CatalogReferenceListPage';
import type { CatalogReferencePageConfig } from '../../components/catalog-reference/catalog-reference-page-config.types';
import { HebrewTexts } from '../../constants/hebrew-texts';
import { QueryKeys } from '../../constants/query-keys';
import { categoriesApi } from '../../services/catalog-reference.api';

const { catalog } = HebrewTexts;

// Everything the shared list page needs to show and edit categories
const categoriesPageConfig: CatalogReferencePageConfig<CategoryResponse, CategoryDetailsInput> = {
  title: catalog.categoriesTitle,
  queryKey: QueryKeys.CATEGORIES,
  api: categoriesApi,
  managePermission: Permission.CATEGORIES_MANAGE,
  columns: [{ header: catalog.nameColumn, renderCell: (category) => category.name }],
  formFields: [{ name: 'name', label: catalog.categoryNameField }],
  formSchema: categoryDetailsSchema,
  emptyFormValues: { name: '' },
  toFormValues: (category) => ({ name: category.name }),
  getRecordName: (category) => category.name,
  texts: {
    addButton: catalog.addCategory,
    createDialogTitle: catalog.createCategoryTitle,
    editDialogTitle: catalog.editCategoryTitle,
    created: catalog.categoryCreated,
    updated: catalog.categoryUpdated,
    disabled: catalog.categoryDisabled,
    reactivated: catalog.categoryReactivated,
    emptyList: catalog.noCategories,
    duplicateName: catalog.duplicateCategoryName,
  },
};

export function CategoriesPage() {
  return <CatalogReferenceListPage config={categoriesPageConfig} />;
}
