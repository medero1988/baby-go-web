import { FormEvent, useEffect, useState } from 'react';
import { storeApi } from '@/api/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { countryMeta } from '@/lib/countries';
import { errorMessage } from '@/lib/errors';
import { useSupportedCountries } from '@/lib/useSupportedCountries';
import type { Store, UpdateBankAccountInput } from '@/types/api';

export function BankCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const { countries } = useSupportedCountries(store.country);
  const defaults = countryMeta(store.country);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<
    UpdateBankAccountInput['accountType']
  >(defaults.accountType);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState(store.country);
  const [currency, setCurrency] = useState(defaults.currency);
  const [iban, setIban] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [address, setAddress] = useState(store.address.addressLine1);
  const [entityType, setEntityType] =
    useState<NonNullable<UpdateBankAccountInput['entityType']>>('individual');

  useEffect(() => {
    const meta = countryMeta(store.country);
    setCountry(store.country);
    setCurrency(meta.currency);
    setAccountType(meta.accountType);
  }, [store.country]);

  function onCountryChange(next: string) {
    const meta = countryMeta(next);
    setCountry(next);
    setCurrency(meta.currency);
    setAccountType(meta.accountType);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onChange(
        await storeApi.updateBankAccount({
          accountType,
          firstName,
          lastName,
          country,
          currency,
          bankName,
          swiftCode: swiftCode || undefined,
          routingNumber: routingNumber || undefined,
          address: address || undefined,
          entityType,
          ...(accountType === 'IBAN'
            ? { iban: iban.replace(/\s/g, '') }
            : { accountNumber }),
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl">Cuenta bancaria</h2>
      <p className="mt-1 text-sm text-muted">
        Chile y Latam no usan IBAN: número de cuenta + moneda local. El API no
        guarda el número completo, solo last4.
      </p>
      {store.bankAccount ? (
        <p className="mt-3 rounded-2xl bg-sand px-4 py-3 text-sm">
          {store.bankAccount.bankName} · {store.bankAccount.accountType} ****
          {store.bankAccount.last4} · {store.bankAccount.holderName} ·{' '}
          {store.bankAccount.country} {store.bankAccount.currency}
        </p>
      ) : null}
      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Tipo de cuenta"
            value={accountType}
            onChange={(e) =>
              setAccountType(
                e.target.value as UpdateBankAccountInput['accountType'],
              )
            }
          >
            <option value="IBAN">IBAN (Europa)</option>
            <option value="NUMBER">Número de cuenta</option>
          </Select>
          <Select
            label="Titular"
            value={entityType}
            onChange={(e) =>
              setEntityType(
                e.target.value as NonNullable<
                  UpdateBankAccountInput['entityType']
                >,
              )
            }
          >
            <option value="individual">Persona</option>
            <option value="company">Empresa</option>
          </Select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Nombre"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Apellido"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="País del banco"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} ({item.code})
              </option>
            ))}
          </Select>
          <Input
            label="Moneda"
            required
            maxLength={3}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toLowerCase())}
          />
        </div>
        {accountType === 'IBAN' ? (
          <Input
            label="IBAN"
            required
            placeholder="NL91ABNA0417164300"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
          />
        ) : (
          <>
            <Input
              label="Número de cuenta"
              required
              placeholder={country === 'CL' ? 'Cuenta corriente / vista' : ''}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <Input
              label="Routing / código banco"
              hint="Opcional. En Chile suele ir el código del banco si Stripe lo pide."
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
            />
          </>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Banco"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Input
            label="SWIFT"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
          />
        </div>
        <Input
          label="Dirección del titular"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Guardar banco
        </Button>
      </form>
    </Card>
  );
}
