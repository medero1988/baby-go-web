import { api } from './client';
import type { SearchBody, SearchQuery, SearchResponse } from '@/types/api';

function toQuery(params: SearchQuery = {}): string {
  const search = new URLSearchParams();
  if (params.offset != null) search.set('offset', String(params.offset));
  if (params.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const searchApi = {
  /** Catálogo público: sin JWT, con `x-api-token`. */
  search: (body: SearchBody = {}, query: SearchQuery = {}) =>
    api.post<SearchResponse>(
      `/v1/search${toQuery({ offset: 0, limit: 20, ...query })}`,
      body,
      false,
    ),
};
