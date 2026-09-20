import { useState } from 'react';
import { storeApi } from '@/api/store';
import { ScheduleEditor } from '@/components/store/ScheduleEditor';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import type { Store } from '@/types/api';
import { ScheduleSummary } from './ScheduleSummary';

export function PickupCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl">Retiro en tienda</h2>
      <p className="mt-1 text-sm text-muted">Máximo 2 franjas por día.</p>
      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}
      {store.customerPickup ? (
        <ScheduleSummary schedule={store.customerPickup} />
      ) : null}
      <ScheduleEditor
        key={`pickup-${store.customerPickup?.available}-${store.customerPickup?.available24h}`}
        initial={store.customerPickup}
        maxPerDay={2}
        loading={loading}
        submitLabel="Guardar retiro"
        onSave={async (body) => {
          setLoading(true);
          setError('');
          try {
            onChange(await storeApi.updatePickup(body));
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      />
    </Card>
  );
}
