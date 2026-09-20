import { api } from './client';
import type {
  CatalogQuery,
  CreateProductInput,
  Paginated,
  Product,
  ProductMedia,
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

export const productsApi = {
  list: (query?: CatalogQuery) =>
    api.get<Paginated<Product>>(`/v1/products${toQuery(query)}`),
  get: (id: string) => api.get<Product>(`/v1/products/${id}`),
  create: (body: CreateProductInput) => api.post<Product>('/v1/products', body),
  update: (
    id: string,
    body: Partial<CreateProductInput> & { status?: string },
  ) => api.patch<Product>(`/v1/products/${id}`, body),
  save: (id: string) => api.post<Product>(`/v1/products/${id}/save`),
  remove: (id: string) => api.del<{ success: boolean }>(`/v1/products/${id}`),
  deactivate: (id: string) =>
    api.patch<Product>(`/v1/products/${id}`, { status: 'inactive' }),
  activate: (id: string) =>
    api.patch<Product>(`/v1/products/${id}`, { status: 'active' }),
  uploadMedia: (id: string, file: File) => {
    const form = new FormData();
    form.append('media', file, file.name);
    return api.upload<ProductMedia>(`/v1/products/${id}/medias`, form);
  },
  removeMedia: (id: string, mediaId: string) =>
    api.del<{ success: boolean }>(`/v1/products/${id}/medias/${mediaId}`),
};
