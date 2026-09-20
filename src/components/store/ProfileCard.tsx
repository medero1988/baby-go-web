import { FormEvent, useState } from 'react';
import { storeApi } from '@/api/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { countryMeta } from '@/lib/countries';
import { errorMessage } from '@/lib/errors';
import { avatarSrc } from '@/lib/media';
import { useSupportedCountries } from '@/lib/useSupportedCountries';
import type { Store } from '@/types/api';

export function ProfileCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const { countries } = useSupportedCountries(store.country);
  const [name, setName] = useState(store.name);
  const [country, setCountry] = useState(store.country);
  const [phone, setPhone] = useState(store.cellPhone);
  const [addressLine1, setAddressLine1] = useState(store.address.addressLine1);
  const [addressLine2, setAddressLine2] = useState(
    store.address.addressLine2 ?? '',
  );
  const [placeId, setPlaceId] = useState(store.address.placeId);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function onAvatar(file?: File) {
    if (!file) return;
    setError('');
    try {
      onChange(await storeApi.uploadAvatar(file));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

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
      onChange(
        await storeApi.updateProfile({
          name,
          country,
          cellPhone: phone,
          address: {
            addressLine1,
            addressLine2: addressLine2 || undefined,
            placeId,
          },
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError('');
    try {
      onChange(await storeApi.resendCellCode());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <Card className="h-fit p-6">
      <div className="flex items-center gap-4">
        {store.avatar ? (
          <img
            src={avatarSrc(store.avatar)}
            alt=""
            className="h-20 w-20 rounded-3xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sand text-muted">
            Sin foto
          </div>
        )}
        <label className="text-sm font-semibold text-terracotta">
          Subir avatar
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onAvatar(e.target.files?.[0])}
          />
        </label>
      </div>

      <h2 className="mt-6 font-display text-2xl">Editar perfil</h2>
      <p className="mt-1 text-sm text-muted">
        Si cambiás el celular, hay que volver a validarlo. Chile y Latam no
        están en el seeder EU: acá sí podés elegirlos.
      </p>
      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
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
              {item.label} ({item.code})
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
          Guardar perfil
        </Button>
      </form>

      {!store.meta.cellValidated ? (
        <p className="mt-4 text-sm text-muted">
          Celular sin validar.{' '}
          <button
            type="button"
            className="font-semibold text-terracotta"
            onClick={resend}
            disabled={resending}
          >
            Reenviar código
          </button>
        </p>
      ) : null}
    </Card>
  );
}
