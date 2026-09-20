import { useMemo } from 'react';
import { settingsApi } from '@/api/settings';
import { mergeCountries } from '@/lib/countries';
import { useAsync } from '@/lib/useAsync';
import type { SupportedCountry } from '@/types/api';

export function useSupportedCountries(extraCode?: string) {
  const query = useAsync(() => settingsApi.countries(), []);
  const countries = useMemo(
    () => mergeCountries(asCountries(query.data?.value), extraCode),
    [query.data, extraCode],
  );
  return { ...query, countries };
}

function asCountries(value: unknown): SupportedCountry[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter(
    (item): item is SupportedCountry =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as SupportedCountry).code === 'string' &&
      typeof (item as SupportedCountry).phoneCode === 'string',
  );
}
