import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeApi } from '@/api/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import type { Store } from '@/types/api';

export function StripeCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const [params, setParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const connect = store.stripeConnect;
  const stripeFlag = params.get('stripe');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (stripeFlag !== 'return' && stripeFlag !== 'refresh') return;

    let cancelled = false;
    setSyncing(true);
    void storeApi
      .syncStripeConnect()
      .then((next) => {
        if (cancelled) return;
        onChangeRef.current(next);
        setParams(
          (current) => {
            const nextParams = new URLSearchParams(current);
            nextParams.delete('stripe');
            return nextParams;
          },
          { replace: true },
        );
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stripeFlag, setParams]);

  async function startOnboarding() {
    setLoading(true);
    setError('');
    try {
      const origin = window.location.origin;
      const result = await storeApi.createStripeAccountLink(
        `${origin}/app/store/edit?stripe=return`,
        `${origin}/app/store/edit?stripe=refresh`,
      );
      window.location.assign(result.url);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  async function sync() {
    setSyncing(true);
    setError('');
    try {
      onChange(await storeApi.syncStripeConnect());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl">Stripe Connect</h2>
      <p className="mt-1 text-sm text-muted">
        Onboarding Express. Stripe crea la cuenta con el país de la tienda (
        {store.country}). Si falla con Chile, el platform account de staging
        puede no soportar CL: cambiá el país a NL/ES para probar Connect.
      </p>
      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}
      <dl className="mt-4 space-y-2 text-sm">
        <Row
          label="Onboarding"
          value={connect?.onboardingComplete ? 'completo' : 'pendiente'}
        />
        <Row
          label="Cargos"
          value={connect?.chargesEnabled ? 'habilitados' : 'no'}
        />
        <Row
          label="Payouts"
          value={connect?.payoutsEnabled ? 'habilitados' : 'no'}
        />
        <Row
          label="Detalles"
          value={connect?.detailsSubmitted ? 'enviados' : 'faltan'}
        />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={startOnboarding} loading={loading}>
          {connect?.onboardingComplete
            ? 'Actualizar cuenta'
            : 'Completar Connect'}
        </Button>
        <Button variant="secondary" onClick={sync} loading={syncing}>
          Sincronizar estado
        </Button>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
