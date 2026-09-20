import { FormEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { storeApi } from '@/api/store';
import { BankCard } from '@/components/store/BankCard';
import { ConfirmCard } from '@/components/store/ConfirmCard';
import { DeliveryCard } from '@/components/store/DeliveryCard';
import { PickupCard } from '@/components/store/PickupCard';
import { ProfileCard } from '@/components/store/ProfileCard';
import { StripeCard } from '@/components/store/StripeCard';
import { useStoreWorkspace } from '@/components/store/StoreWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';

export function StoreEdit() {
  const { store, onChange } = useStoreWorkspace();
  const location = useLocation();
  const [code, setCode] = useState(store.devCode ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  async function verifyCell(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onChange(await storeApi.verifyCell(code));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Acá se edita el funnel. La ficha pública está en Información.
      </p>
      {error ? <ErrorBanner message={error} /> : null}

      {!store.meta.cellValidated ? (
        <Card className="p-6">
          <h2 className="font-display text-2xl">Validar celular</h2>
          {store.devCode ? (
            <p className="mt-1 text-sm text-muted">
              Código de desarrollo: <strong>{store.devCode}</strong>
            </p>
          ) : null}
          <form className="mt-4 flex gap-3" onSubmit={verifyCell}>
            <Input
              label="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex items-end">
              <Button type="submit" loading={loading}>
                Validar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div id="profile">
        <ProfileCard store={store} onChange={onChange} />
      </div>
      <div id="delivery">
        <DeliveryCard store={store} onChange={onChange} />
      </div>
      <div id="pickup">
        <PickupCard store={store} onChange={onChange} />
      </div>
      <div id="bank">
        <BankCard store={store} onChange={onChange} />
      </div>
      <ConfirmCard store={store} onChange={onChange} />
      <div id="stripe">
        <StripeCard store={store} onChange={onChange} />
      </div>
    </div>
  );
}
