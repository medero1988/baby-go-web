import { api } from './client';
import {
  SETTING_CODES,
  type Setting,
  type SettingValue,
  type SupportedCountry,
} from '@/types/api';

export const settingsApi = {
  getByCode: <T = SettingValue>(code: string) =>
    api.get<Setting & { value: T }>(`/v1/settings/${code}`, false),
  countries: () =>
    settingsApi.getByCode<SupportedCountry[]>(
      SETTING_CODES.SUPPORTED_COUNTRIES,
    ),
  productTaxonomy: () =>
    settingsApi.getByCode<{ families: unknown }>(
      SETTING_CODES.PRODUCT_TAXONOMY,
    ),
};
