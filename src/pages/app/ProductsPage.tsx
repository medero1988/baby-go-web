import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { productsApi } from '@/api/products';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';
import type { ProductStatus } from '@/types/api';

export function ProductsPage() {
  const taxonomy = useTaxonomy();
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [familyId, setFamilyId] = useState('');
  const [category, setCategory] = useState('');
  const query = useMemo(
    () => ({
      status: status || undefined,
      category: category || undefined,
      limit: 24,
    }),
    [status, category],
  );
  const { data, error, loading } = useAsync(
    () => productsApi.list(query),
    [query.status, query.category],
  );

  const familyCategories = taxonomy.getFamily(familyId)?.categories ?? [];
  const items = (data?.items ?? []).filter((product) => {
    if (!familyId || category) return true;
    return taxonomy.getCategory(product.category)?.familyId === familyId;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Catálogo
          </p>
          <h1 className="mt-1 font-display text-4xl">Productos</h1>
        </div>
        <Button to="/app/products/new" icon={<Plus size={16} />}>
          Nuevo
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={!status}
          onClick={() => setStatus('')}
          label="Todos"
        />
        {(['draft', 'active', 'inactive'] as const).map((item) => (
          <FilterChip
            key={item}
            active={status === item}
            onClick={() => setStatus(item)}
            label={item}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={!familyId}
          onClick={() => {
            setFamilyId('');
            setCategory('');
          }}
          label="Todas las familias"
        />
        {taxonomy.families.map((family) => (
          <FilterChip
            key={family.id}
            active={familyId === family.id}
            onClick={() => {
              setFamilyId(family.id);
              setCategory('');
            }}
            label={family.label}
          />
        ))}
        {familyId ? (
          <select
            className="rounded-full border border-line bg-paper px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">
              Todas en {taxonomy.getFamily(familyId)?.label}
            </option>
            {familyCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {loading ? <Spinner /> : null}
      {error ? <ErrorBanner message={errorMessage(error)} /> : null}
      {data && items.length === 0 ? (
        <EmptyState
          title="Sin productos"
          body="Creá el primero. Queda en draft hasta que lo completes y lo publiques."
          action={<Button to="/app/products/new">Crear producto</Button>}
        />
      ) : null}
      {items.length ? (
        <>
          <p className="text-sm text-muted">
            {items.length} producto{items.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-3 py-2 text-sm font-semibold capitalize ${
        active
          ? 'bg-ink text-paper'
          : 'bg-paper text-ink-soft border border-line'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
