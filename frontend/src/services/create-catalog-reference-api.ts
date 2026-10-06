import type { PaginatedList, RecordStatus } from '@library/shared';
import { sendApiRequest, sendPaginatedApiRequest } from './api-client';

// Query string accepted by every catalog list endpoint
export interface CatalogReferenceListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: RecordStatus;
}

// The calls every catalog resource (authors, publishers, categories) supports
export interface CatalogReferenceApi<RecordResponse, Details> {
  list: (params: CatalogReferenceListParams) => Promise<PaginatedList<RecordResponse>>;
  create: (details: Details) => Promise<RecordResponse>;
  update: (id: string, details: Details) => Promise<RecordResponse>;
  disable: (id: string) => Promise<RecordResponse>;
  reactivate: (id: string) => Promise<RecordResponse>;
}

// Builds the API calls for one catalog resource, e.g. createCatalogReferenceApi('/authors')
export const createCatalogReferenceApi = <RecordResponse, Details>(
  resourcePath: string,
): CatalogReferenceApi<RecordResponse, Details> => ({
  list: (params) =>
    sendPaginatedApiRequest<RecordResponse>({ method: 'GET', url: resourcePath, params }),

  create: (details) =>
    sendApiRequest<RecordResponse>({ method: 'POST', url: resourcePath, data: details }),

  update: (id, details) =>
    sendApiRequest<RecordResponse>({
      method: 'PATCH',
      url: `${resourcePath}/${id}`,
      data: details,
    }),

  disable: (id) =>
    sendApiRequest<RecordResponse>({ method: 'POST', url: `${resourcePath}/${id}/disable` }),

  reactivate: (id) =>
    sendApiRequest<RecordResponse>({ method: 'POST', url: `${resourcePath}/${id}/reactivate` }),
});
