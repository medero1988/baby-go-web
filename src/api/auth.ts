import { api } from './client';
import type { AuthResult, CreateAccountResponse } from '@/types/api';

export const authApi = {
  createAccount: (body: {
    name: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post<CreateAccountResponse>('/v1/auth/account', body, false),

  verifyEmail: (body: { accountId: string; code: string }) =>
    api.post<{ success: boolean }>('/v1/auth/email-verification', body, false),

  resendEmailCode: (accountId: string) =>
    api.post<{ success: boolean }>(
      '/v1/auth/resend-email-code',
      { accountId },
      false,
    ),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResult>('/v1/auth/login', body, false),

  getAccount: () => api.get<AuthResult['user']>('/v1/auth/account'),

  logout: (refreshToken: string) =>
    api.post<{ success: boolean }>('/v1/auth/logout', { refreshToken }),

  passwordRecovery: (email: string) =>
    api.post<{ success: boolean }>(
      '/v1/auth/password-recovery',
      { email },
      false,
    ),

  resendPasswordRecovery: (email: string) =>
    api.post<{ success: boolean }>(
      '/v1/auth/resend-password-recovery',
      { email },
      false,
    ),

  newPassword: (body: {
    email: string;
    recoveryCode: string;
    newPassword: string;
  }) => api.post<{ success: boolean }>('/v1/auth/new-password', body, false),
};
