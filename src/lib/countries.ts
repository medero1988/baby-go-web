import type { SupportedCountry } from '@/types/api';

export type CountryOption = {
  code: string;
  label: string;
  phoneCode: string;
  currency: string;
  accountType: 'IBAN' | 'NUMBER';
};

export const COUNTRY_CATALOG: CountryOption[] = [
  {
    code: 'CL',
    label: 'Chile',
    phoneCode: '+56',
    currency: 'clp',
    accountType: 'NUMBER',
  },
  {
    code: 'AR',
    label: 'Argentina',
    phoneCode: '+54',
    currency: 'ars',
    accountType: 'NUMBER',
  },
  {
    code: 'MX',
    label: 'México',
    phoneCode: '+52',
    currency: 'mxn',
    accountType: 'NUMBER',
  },
  {
    code: 'US',
    label: 'Estados Unidos',
    phoneCode: '+1',
    currency: 'usd',
    accountType: 'NUMBER',
  },
  {
    code: 'UK',
    label: 'Reino Unido',
    phoneCode: '+44',
    currency: 'gbp',
    accountType: 'NUMBER',
  },
  {
    code: 'NL',
    label: 'Países Bajos',
    phoneCode: '+31',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'ES',
    label: 'España',
    phoneCode: '+34',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'IT',
    label: 'Italia',
    phoneCode: '+39',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'DE',
    label: 'Alemania',
    phoneCode: '+49',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'BE',
    label: 'Bélgica',
    phoneCode: '+32',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'PT',
    label: 'Portugal',
    phoneCode: '+351',
    currency: 'eur',
    accountType: 'IBAN',
  },
  {
    code: 'FR',
    label: 'Francia',
    phoneCode: '+33',
    currency: 'eur',
    accountType: 'IBAN',
  },
];

export function countryMeta(code: string): CountryOption {
  return (
    COUNTRY_CATALOG.find((item) => item.code === code) ?? {
      code,
      label: code,
      phoneCode: '+',
      currency: 'eur',
      accountType: 'IBAN',
    }
  );
}

export function mergeCountries(
  fromSettings?: SupportedCountry[],
  extraCode?: string,
): CountryOption[] {
  const map = new Map<string, CountryOption>();
  for (const item of COUNTRY_CATALOG) map.set(item.code, item);
  for (const item of fromSettings ?? []) {
    const existing = map.get(item.code);
    map.set(item.code, {
      ...(existing ?? countryMeta(item.code)),
      phoneCode: item.phoneCode,
    });
  }
  if (extraCode) map.set(extraCode, countryMeta(extraCode));
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
