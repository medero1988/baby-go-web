import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { bundlesApi } from '@/api/bundles';
import { BundleCard } from '@/components/catalog/BundleCard';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';
import type { ProductStatus } from '@/types/api';

export function BundlesPage() {
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const query = useMemo(
    () => ({ status: status || undefined, limit: 24 }),
    [status],
  );
  const { data, error, loading } = useAsync(
    () => bundlesApi.list(query),
    [query.status],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Combos
          </p>
          <h1 className="mt-1 font-display text-4xl">Bundles</h1>
        </div>
        <Button to="/app/bundles/new" icon={<Plus size={16} />}>
          Nuevo combo
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['', 'draft', 'active', 'inactive'] as const).map((item) => (
          <button
            key={item || 'all'}
            className={`rounded-full px-3 py-2 text-sm font-semibold capitalize ${
              status === item
                ? 'bg-ink text-paper'
                : 'border border-line bg-paper text-ink-soft'
            }`}
            onClick={() => setStatus(item)}
          >
            {item || 'Todos'}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : null}
      {error ? <ErrorBanner message={errorMessage(error)} /> : null}
      {data && data.items.length === 0 ? (
        <EmptyState
          title="Sin combos"
          body="Un bundle junta entre 2 y 10 productos propios. Para publicarlo, todos tienen que estar active."
          action={<Button to="/app/bundles/new">Crear combo</Button>}
        />
      ) : null}
      {data?.items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
