import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bundlesApi } from '@/api/bundles';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Field';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';
import type { Product } from '@/types/api';

export function BundleFormPage() {
  const { id = '' } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const products = useAsync(
    () => productsApi.list({ status: 'active', limit: 100 }),
    [],
  );
  const bundleQuery = useAsync(
    () => (editing ? bundlesApi.get(id) : Promise.resolve(null)),
    [editing, id],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [list, setList] = useState('20');
  const [offer, setOffer] = useState('');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeUntil, setActiveUntil] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [extraProducts, setExtraProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(!editing);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editing || !bundleQuery.data || hydrated) return;
    const bundle = bundleQuery.data;
    setTitle(bundle.title);
    setDescription(bundle.description);
    setList(String(bundle.price.list ?? ''));
    setOffer(bundle.price.offer != null ? String(bundle.price.offer) : '');
    setActiveFrom(bundle.price.activeFrom ?? '');
    setActiveUntil(bundle.price.activeUntil ?? '');
    setSelected(bundle.products.map((product) => product.id));
    setExtraProducts(bundle.products);
    setHydrated(true);
  }, [editing, bundleQuery.data, hydrated]);

  const items = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products.data?.items ?? []) {
      map.set(product.id, product);
    }
    for (const product of extraProducts) {
      if (!map.has(product.id)) map.set(product.id, product);
    }
    return [...map.values()];
  }, [products.data, extraProducts]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(productId: string) {
    setSelected((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const price = {
        list: Number(list),
        ...(offer
          ? {
              offer: Number(offer),
              activeFrom,
              activeUntil,
            }
          : editing
            ? { offer: null as null }
            : {}),
      };

      const bundle = editing
        ? await bundlesApi.update(id, {
            title,
            description,
            products: selected,
            price,
          })
        : await bundlesApi.create({
            title,
            description,
            products: selected,
            price: {
              list: Number(list),
              ...(offer
                ? {
                    offer: Number(offer),
                    activeFrom,
                    activeUntil,
                  }
                : {}),
            },
          });
      navigate(`/app/bundles/${bundle.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (products.loading || (editing && (!hydrated || bundleQuery.loading))) {
    return <Spinner />;
  }
  if (editing && bundleQuery.error) {
    return <ErrorBanner message={errorMessage(bundleQuery.error)} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={editing ? `/app/bundles/${id}` : '/app/bundles'}
          className="text-sm font-semibold text-muted"
        >
          ← {editing ? 'Combo' : 'Combos'}
        </Link>
        <h1 className="mt-2 font-display text-4xl">
          {editing ? 'Editar combo' : 'Nuevo combo'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Elegí entre 2 y 10 productos. La categoría la arma el backend.
        </p>
      </div>
      <Card className="p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? <ErrorBanner message={error} /> : null}
          <Input
            label="Título"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Descripción"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Precio lista (€ / día)"
              type="number"
              min="0"
              step="0.5"
              required
              value={list}
              onChange={(e) => setList(e.target.value)}
            />
            <Input
              label="Oferta (€ / día)"
              type="number"
              min="0"
              step="0.5"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              hint={
                editing && !offer
                  ? 'Vacío al guardar quita la oferta.'
                  : undefined
              }
            />
          </div>
          {offer ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Oferta desde"
                type="date"
                required
                value={activeFrom}
                onChange={(e) => setActiveFrom(e.target.value)}
              />
              <Input
                label="Oferta hasta"
                type="date"
                required
                value={activeUntil}
                onChange={(e) => setActiveUntil(e.target.value)}
              />
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">
              Productos ({selected.length})
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {items.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => toggle(product.id)}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm ${
                    selectedSet.has(product.id)
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line bg-white'
                  }`}
                >
                  <strong>{product.title}</strong>
                  <span className="mt-1 block opacity-70">
                    {product.category}
                    {product.status !== 'active' ? ` · ${product.status}` : ''}
                  </span>
                </button>
              ))}
            </div>
            {!items.length ? (
              <p className="text-sm text-muted">
                No hay productos active. Publicá al menos dos antes de armar un
                combo.
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={selected.length < 2}
          >
            {editing ? 'Guardar cambios' : 'Crear combo'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
