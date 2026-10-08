// One choice in an author/category/publisher picker
export interface ReferenceOption {
  id: string;
  label: string;
}

// Where a picker loads its choices from (searched on the server while typing)
export interface ReferenceOptionSource {
  queryKey: readonly string[];
  loadOptions: (searchText?: string) => Promise<ReferenceOption[]>;
}
