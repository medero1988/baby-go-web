import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ScheduleSummary } from '@/components/store/ScheduleSummary';
import { Card } from '@/components/ui/Card';
import { countryMeta } from '@/lib/countries';
import { eurosFromCents } from '@/lib/format';
import { avatarSrc } from '@/lib/media';
import type { Store } from '@/types/api';

export function StoreOverview({ store }: { store: Store }) {
  const country = countryMeta(store.country);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
          {store.avatar ? (
            <img
              src={avatarSrc(store.avatar)}
              alt=""
              className="h-28 w-28 rounded-[28px] object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-sand text-sm text-muted">
              Sin foto
            </div>
          )}
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Perfil
              </p>
              <Link
                to="/app/store/edit#profile"
                className="text-sm font-semibold text-terracotta"
              >
                Editar
              </Link>
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Fact
                label="País"
                value={`${country.label} (${store.country})`}
              />
              <Fact label="Celular" value={store.cellPhone} />
              <Fact
                label="Cel validado"
                value={store.meta.cellValidated ? 'Sí' : 'Pendiente'}
              />
              <Fact label="Último paso" value={store.meta.lastSteep} />
              <Fact
                label="Dirección"
                value={[store.address.addressLine1, store.address.addressLine2]
                  .filter(Boolean)
                  .join(' · ')}
              />
            </dl>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          title="Delivery"
          empty={!store.delivery}
          editTo="/app/store/edit#delivery"
        >
          {store.delivery ? (
            <>
              <ScheduleSummary schedule={store.delivery} />
              {store.delivery.basePrice != null ? (
                <p className="mt-3 text-sm text-muted">
                  Base {eurosFromCents(store.delivery.basePrice)} ·{' '}
                  {eurosFromCents(store.delivery.pricePerKm ?? 0)}/km · máx{' '}
                  {store.delivery.maxDeliveryDistance ?? 0} km
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted">Tarifas sin cargar.</p>
              )}
            </>
          ) : null}
        </InfoCard>

        <InfoCard
          title="Retiro en tienda"
          empty={!store.customerPickup}
          editTo="/app/store/edit#pickup"
        >
          {store.customerPickup ? (
            <ScheduleSummary schedule={store.customerPickup} />
          ) : null}
        </InfoCard>

        <InfoCard
          title="Cuenta bancaria"
          empty={!store.bankAccount}
          editTo="/app/store/edit#bank"
        >
          {store.bankAccount ? (
            <p className="mt-3 text-sm">
              {store.bankAccount.bankName} · {store.bankAccount.accountType}{' '}
              ****
              {store.bankAccount.last4}
              <br />
              {store.bankAccount.holderName} · {store.bankAccount.country}{' '}
              {store.bankAccount.currency.toUpperCase()}
            </p>
          ) : null}
        </InfoCard>

        <InfoCard title="Stripe Connect" editTo="/app/store/edit#stripe">
          <dl className="mt-3 space-y-2 text-sm">
            <Fact
              label="Onboarding"
              value={
                store.stripeConnect?.onboardingComplete
                  ? 'completo'
                  : 'pendiente'
              }
            />
            <Fact
              label="Cargos"
              value={store.stripeConnect?.chargesEnabled ? 'sí' : 'no'}
            />
            <Fact
              label="Payouts"
              value={store.stripeConnect?.payoutsEnabled ? 'sí' : 'no'}
            />
          </dl>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  empty,
  editTo,
  children,
}: {
  title: string;
  empty?: boolean;
  editTo: string;
  children?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link to={editTo} className="text-sm font-semibold text-terracotta">
          {empty ? 'Configurar' : 'Editar'}
        </Link>
      </div>
      {empty ? (
        <p className="mt-3 text-sm text-muted">Todavía no configurado.</p>
      ) : (
        children
      )}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}
