import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Package, Store, Wallet } from 'lucide-react';
import { productsApi } from '@/api/products';
import { bundlesApi } from '@/api/bundles';
import { storeApi } from '@/api/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { useAuth } from '@/auth/AuthProvider';
import { errorMessage } from '@/lib/errors';
import { eurosFromCents } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/types/api';

export function DashboardPage() {
  const { user } = useAuth();
  const storeQuery = useAsync(async () => {
    try {
      return await storeApi.get();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'store_not_found')
        return null;
      throw err;
    }
  }, []);
  const productsQuery = useAsync(() => productsApi.list({ limit: 6 }), []);
  const bundlesQuery = useAsync(() => bundlesApi.list({ limit: 4 }), []);
  const movementsQuery = useAsync(async () => {
    try {
      return await storeApi.movements();
    } catch {
      return null;
    }
  }, []);

  const loading =
    storeQuery.loading || productsQuery.loading || bundlesQuery.loading;
  const error = storeQuery.error || productsQuery.error || bundlesQuery.error;

  if (loading) return <Spinner label="Cargando el panel" />;
  if (error) return <ErrorBanner message={errorMessage(error)} />;

  const store = storeQuery.data;
  const products = productsQuery.data;
  const bundles = bundlesQuery.data;
  const movements = movementsQuery.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Provider
          </p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">
            Hola, {user?.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Este panel lee las APIs de `/v1/store`, `/v1/products`,
            `/v1/bundles` y `/v1/store/movements`.
          </p>
        </div>
        <Button
          to={store ? '/app/products/new' : '/app/store'}
          icon={<ArrowRight size={16} />}
        >
          {store ? 'Nuevo producto' : 'Crear tienda'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={Store}
          label="Tienda"
          value={store?.name ?? 'Sin tienda'}
          extra={store ? <Badge value={store.meta.state} /> : null}
        />
        <Stat
          icon={Package}
          label="Productos"
          value={String(products?.total ?? 0)}
        />
        <Stat icon={Boxes} label="Combos" value={String(bundles?.total ?? 0)} />
        <Stat
          icon={Wallet}
          label="Cobrado"
          value={
            movements
              ? eurosFromCents(
                  movements.summary.collected,
                  movements.summary.currency,
                )
              : '—'
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Últimos productos</h2>
            <Link
              to="/app/products"
              className="text-sm font-semibold text-terracotta"
            >
              Ver todos
            </Link>
          </div>
          {products?.items.length ? (
            <div className="space-y-3">
              {products.items.map((product) => (
                <Link
                  key={product.id}
                  to={`/app/products/${product.id}`}
                  className="flex items-center justify-between rounded-2xl bg-sand px-3 py-3"
                >
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-xs text-muted">{product.category}</p>
                  </div>
                  <Badge value={product.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Todavía no hay productos.</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Tienda</h2>
            <Link
              to="/app/store"
              className="text-sm font-semibold text-terracotta"
            >
              Detalle
            </Link>
          </div>
          {store ? (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted">País</span>
                <br />
                <strong>{store.country}</strong>
              </p>
              <p>
                <span className="text-muted">Dirección</span>
                <br />
                <strong>{store.address.addressLine1}</strong>
              </p>
              <p>
                <span className="text-muted">Último paso del funnel</span>
                <br />
                <strong>{store.meta.lastSteep}</strong>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Creá el perfil de tienda para publicar catálogo.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  extra,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  extra?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <Icon size={18} className="text-terracotta" />
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 truncate font-display text-2xl">{value}</p>
      {extra ? <div className="mt-3">{extra}</div> : null}
    </Card>
  );
}
