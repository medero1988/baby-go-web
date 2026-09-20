import { api } from './client';
import type {
  AccountLinkResponse,
  CreateStoreProfileInput,
  ProviderMovementsResponse,
  Store,
  UpdateBankAccountInput,
  UpdateDeliveryPricingInput,
  UpdateScheduleInput,
  UpdateStoreProfileInput,
} from '@/types/api';

export const storeApi = {
  get: () => api.get<Store>('/v1/store'),
  createProfile: (body: CreateStoreProfileInput) =>
    api.post<Store>('/v1/store/profile', body),
  updateProfile: (body: UpdateStoreProfileInput) =>
    api.patch<Store>('/v1/store/profile', body),
  verifyCell: (code: string) =>
    api.post<Store>('/v1/store/cell-verification', { code }),
  resendCellCode: () => api.post<Store>('/v1/store/cell-verification/resend'),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file, file.name);
    return api.upload<Store>('/v1/store/avatar', form);
  },
  updateDelivery: (body: UpdateScheduleInput) =>
    api.post<Store>('/v1/store/delivery', body),
  updateDeliveryPricing: (body: UpdateDeliveryPricingInput) =>
    api.post<Store>('/v1/store/delivery-pricing', body),
  updatePickup: (body: UpdateScheduleInput) =>
    api.post<Store>('/v1/store/customer-pickup', body),
  updateBankAccount: (body: UpdateBankAccountInput) =>
    api.post<Store>('/v1/store/bank-account', body),
  confirm: () =>
    api.post<Store>('/v1/store/confirmation', { acceptedTerms: true }),
  createStripeAccountLink: (returnUrl: string, refreshUrl: string) =>
    api.post<AccountLinkResponse>('/v1/store/stripe-connect/account-link', {
      returnUrl,
      refreshUrl,
    }),
  syncStripeConnect: () => api.get<Store>('/v1/store/stripe-connect/status'),
  movements: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return api.get<ProviderMovementsResponse>(`/v1/store/movements${query}`);
  },
};
