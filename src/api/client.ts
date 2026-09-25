import { ApiError, type ApiErrorBody } from '@/types/api';
import { session } from '@/lib/session';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN?.trim();

function withApiToken(headers: Record<string, string>): Record<string, string> {
  if (API_TOKEN) headers['x-api-token'] = API_TOKEN;
  return headers;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  formData?: FormData;
  retry?: boolean;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = session.getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/v1/auth/access-refresh`, {
    method: 'POST',
    headers: withApiToken({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    session.clear();
    return false;
  }

  const data = (await response.json()) as RefreshResponse;
  session.updateTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, formData, retry = true } = options;
  const headers = withApiToken({ ...options.headers });

  if (!formData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = session.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const errorBody = (payload ?? {}) as ApiErrorBody;
    throw new ApiError({
      status: response.status,
      statusCode: errorBody.statusCode ?? response.status,
      error: errorBody.error,
      message: errorBody.message,
      missing: errorBody.missing,
    });
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, auth = true) => apiRequest<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: 'PATCH', body, auth }),
  del: <T>(path: string, auth = true) =>
    apiRequest<T>(path, { method: 'DELETE', auth }),
  upload: <T>(path: string, formData: FormData) =>
    apiRequest<T>(path, { method: 'POST', formData }),
};
