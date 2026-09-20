import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bundlesApi } from '@/api/bundles';
import { PriceTag } from '@/components/catalog/PriceTag';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';

export function BundleDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useAsync(() => bundlesApi.get(id), [id]);
  const { categoryLabel } = useTaxonomy();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (query.loading) return <Spinner />;
  if (query.error) return <ErrorBanner message={errorMessage(query.error)} />;
  if (!query.data) return null;

  const bundle = query.data;

  async function publish() {
    setBusy(true);
    setError('');
    try {
      query.setData(await bundlesApi.save(bundle.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('¿Borrar este combo? Los productos no se borran.')) return;
    setBusy(true);
    setError('');
    try {
      await bundlesApi.remove(bundle.id);
      navigate('/app/bundles');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/app/bundles" className="text-sm font-semibold text-muted">
        ← Combos
      </Link>
      {error ? <ErrorBanner message={error} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">{bundle.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge value={bundle.status} />
            {bundle.category.map((item) => (
              <span
                key={item}
                className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold"
              >
                {categoryLabel(item)}
              </span>
            ))}
          </div>
        </div>
        <PriceTag price={bundle.price} />
      </div>
      <p className="max-w-2xl text-sm leading-6 text-ink-soft">
        {bundle.description}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button to={`/app/bundles/${bundle.id}/edit`} variant="secondary">
          Editar
        </Button>
        {bundle.status !== 'active' ? (
          <Button onClick={publish} loading={busy}>
            Publicar
          </Button>
        ) : null}
        <Button variant="ghost" onClick={remove} loading={busy}>
          Borrar
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {bundle.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
