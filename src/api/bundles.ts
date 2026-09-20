import { api } from './client';
import type {
  Bundle,
  CatalogQuery,
  CreateBundleInput,
  Paginated,
  UpdateBundleInput,
} from '@/types/api';

function toQuery(params: CatalogQuery = {}): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.category) search.set('category', params.category);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const value = search.toString();
  return value ? `?${value}` : '';
}

export const bundlesApi = {
  list: (query?: CatalogQuery) =>
    api.get<Paginated<Bundle>>(`/v1/bundles${toQuery(query)}`),
  get: (id: string) => api.get<Bundle>(`/v1/bundles/${id}`),
  create: (body: CreateBundleInput) => api.post<Bundle>('/v1/bundles', body),
  update: (id: string, body: UpdateBundleInput) =>
    api.patch<Bundle>(`/v1/bundles/${id}`, body),
  save: (id: string) => api.post<Bundle>(`/v1/bundles/${id}/save`),
  remove: (id: string) => api.del<{ success: boolean }>(`/v1/bundles/${id}`),
};
