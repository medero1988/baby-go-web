import { FormEvent, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { storeApi } from '@/api/store';
import { StoreEdit } from '@/components/store/StoreEdit';
import { StoreHeader, StoreTabs } from '@/components/store/StoreNav';
import { StoreOverview } from '@/components/store/StoreOverview';
import {
  StoreWorkspaceProvider,
  useStoreWorkspace,
} from '@/components/store/StoreWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { countryMeta } from '@/lib/countries';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';
import { useSupportedCountries } from '@/lib/useSupportedCountries';
import { ApiError, type Store } from '@/types/api';

export function StorePage() {
  const query = useAsync(async () => {
    try {
      return await storeApi.get();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'store_not_found')
        return null;
      throw err;
    }
  }, []);

  if (query.loading) return <Spinner label="Cargando tienda" />;
  if (query.error) return <ErrorBanner message={errorMessage(query.error)} />;

  if (!query.data) {
    return <CreateStoreForm onCreated={(store) => query.setData(store)} />;
  }

  return (
    <StoreWorkspaceProvider
      value={{ store: query.data, onChange: query.setData }}
    >
      <div className="space-y-6">
        <StoreHeader store={query.data} />
        <StoreTabs />
        <Outlet />
      </div>
    </StoreWorkspaceProvider>
  );
}

export function StoreOverviewPage() {
  const { store } = useStoreWorkspace();
  return <StoreOverview store={store} />;
}

export function StoreEditPage() {
  return <StoreEdit />;
}

function CreateStoreForm({ onCreated }: { onCreated: (store: Store) => void }) {
  const { countries } = useSupportedCountries();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('CL');
  const [phone, setPhone] = useState('+56');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [placeId, setPlaceId] = useState('manual-place');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onCountryChange(next: string) {
    const prev = countryMeta(country).phoneCode;
    const prefix = countryMeta(next).phoneCode;
    setCountry(next);
    if (!phone || phone === prev || phone.startsWith(prev)) {
      setPhone(
        prefix + (phone.startsWith(prev) ? phone.slice(prev.length) : ''),
      );
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const store = await storeApi.createProfile({
        name,
        country,
        cellPhone: phone,
        address: { addressLine1, addressLine2, placeId },
      });
      onCreated(store);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Funnel
        </p>
        <h1 className="mt-1 font-display text-4xl">Crear tienda</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Primer paso: perfil. El celular dispara OTP.
        </p>
      </div>
      <Card className="max-w-2xl p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? <ErrorBanner message={error} /> : null}
          <Input
            label="Nombre de la tienda"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="País"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} ({item.code}) · {item.phoneCode}
              </option>
            ))}
          </Select>
          <Input
            label="Celular"
            required
            placeholder={countryMeta(country).phoneCode}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Dirección"
            required
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
          <Input
            label="Indicaciones"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
          <Input
            label="Google Place ID"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
          />
          <Button type="submit" loading={loading}>
            Crear perfil
          </Button>
        </form>
      </Card>
    </div>
  );
}
