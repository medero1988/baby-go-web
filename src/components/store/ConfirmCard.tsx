import { FormEvent, useState } from 'react';
import { storeApi } from '@/api/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import type { Store } from '@/types/api';

export function ConfirmCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmed = store.meta.state !== 'missing-info';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onChange(await storeApi.confirm());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl">Confirmación</h2>
      {confirmed ? (
        <p className="mt-2 text-sm">
          Tienda enviada a revisión
          {store.meta.confirmedAt
            ? ` el ${new Date(store.meta.confirmedAt).toLocaleDateString('es-ES')}`
            : ''}
          .
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            Requiere celular validado y cuenta bancaria. Pasa el estado a
            pending-review.
          </p>
          {error ? (
            <div className="mt-3">
              <ErrorBanner message={error} />
            </div>
          ) : null}
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              Acepto los términos y condiciones de Flyfree.
            </label>
            <Button type="submit" loading={loading} disabled={!accepted}>
              Enviar a revisión
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}
