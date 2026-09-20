import { storeApi } from '@/api/store';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { errorMessage } from '@/lib/errors';
import { eurosFromCents, formatDateTime } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/types/api';

export function MovementsPage() {
  const query = useAsync(async () => {
    try {
      return await storeApi.movements();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'store_not_found')
        return null;
      throw err;
    }
  }, []);

  if (query.loading) return <Spinner />;
  if (query.error) return <ErrorBanner message={errorMessage(query.error)} />;
  if (!query.data) {
    return (
      <EmptyState
        title="Sin tienda"
        body="Los movimientos aparecen cuando hay una store y pagos de clientes."
      />
    );
  }

  const { summary, movements } = query.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Pagos
        </p>
        <h1 className="mt-1 font-display text-4xl">Movimientos</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Summary
          label="Cobrado"
          value={eurosFromCents(summary.collected, summary.currency)}
        />
        <Summary
          label="Transferido"
          value={eurosFromCents(summary.earningsTransferred, summary.currency)}
        />
        <Summary
          label="Pendiente"
          value={eurosFromCents(summary.earningsPending, summary.currency)}
        />
        <Summary
          label="Fee plataforma"
          value={eurosFromCents(summary.platformFees, summary.currency)}
        />
      </div>
      {movements.length === 0 ? (
        <EmptyState
          title="Todavía no hay pagos"
          body="Cuando un cliente pague un alquiler, el movimiento aparece acá. Los montos vienen en centavos."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sand text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Orden</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Tu parte</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">{item.orderId || '—'}</td>
                    <td className="px-4 py-3">
                      {eurosFromCents(item.amount, item.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {eurosFromCents(item.providerAmount, item.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </Card>
  );
}
