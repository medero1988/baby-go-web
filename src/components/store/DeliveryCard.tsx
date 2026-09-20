import { FormEvent, useState } from 'react';
import { storeApi } from '@/api/store';
import { ScheduleEditor } from '@/components/store/ScheduleEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { centsToEuroInput, eurosFromCents, eurosToCents } from '@/lib/format';
import type { Store } from '@/types/api';
import { ScheduleSummary } from './ScheduleSummary';

export function DeliveryCard({
  store,
  onChange,
}: {
  store: Store;
  onChange: (store: Store) => void;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [basePrice, setBasePrice] = useState(
    centsToEuroInput(store.delivery?.basePrice) || '1',
  );
  const [priceKm, setPriceKm] = useState(
    centsToEuroInput(store.delivery?.pricePerKm) || '0.30',
  );
  const [maxKm, setMaxKm] = useState(
    String(store.delivery?.maxDeliveryDistance ?? 30),
  );

  async function saveSchedule(
    body: Parameters<typeof storeApi.updateDelivery>[0],
  ) {
    setLoading(true);
    setError('');
    try {
      onChange(await storeApi.updateDelivery(body));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function savePricing(event: FormEvent) {
    event.preventDefault();
    setPricingLoading(true);
    setError('');
    try {
      onChange(
        await storeApi.updateDeliveryPricing({
          basePrice: eurosToCents(Number(basePrice)),
          priceKm: eurosToCents(Number(priceKm)),
          maxDeliveryDistance: Number(maxKm),
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPricingLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl">Delivery</h2>
      <p className="mt-1 text-sm text-muted">
        Horario y tarifas. Los precios se mandan en centavos.
      </p>
      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}
      {store.delivery ? <ScheduleSummary schedule={store.delivery} /> : null}
      <ScheduleEditor
        key={`delivery-${store.meta.lastSteep}-${store.delivery?.available}`}
        initial={store.delivery}
        maxPerDay={3}
        loading={loading}
        submitLabel="Guardar horario"
        onSave={saveSchedule}
      />

      {store.delivery ? (
        <form
          className="mt-6 space-y-3 border-t border-line pt-5"
          onSubmit={savePricing}
        >
          <p className="text-sm font-semibold text-ink-soft">Tarifas</p>
          {store.delivery.basePrice != null ? (
            <p className="text-sm text-muted">
              Base {eurosFromCents(store.delivery.basePrice)} ·{' '}
              {eurosFromCents(store.delivery.pricePerKm ?? 0)}/km · máx{' '}
              {store.delivery.maxDeliveryDistance ?? 0} km
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Base (€)"
              type="number"
              min="0"
              step="0.01"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
            <Input
              label="Por km (€)"
              type="number"
              min="0"
              step="0.01"
              required
              value={priceKm}
              onChange={(e) => setPriceKm(e.target.value)}
            />
            <Input
              label="Máx km"
              type="number"
              min="1"
              required
              value={maxKm}
              onChange={(e) => setMaxKm(e.target.value)}
            />
          </div>
          <Button type="submit" loading={pricingLoading}>
            Guardar tarifas
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Guardá el horario para poder cargar tarifas.
        </p>
      )}
    </Card>
  );
}
