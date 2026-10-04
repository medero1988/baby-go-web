import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { TaxonomyGate, useTaxonomy } from '@/catalog/TaxonomyProvider';
import { AttributeFields } from '@/components/catalog/AttributeFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { toIsoDate } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';

function toDateInput(value?: string): string {
  if (!value) return '';
  return toIsoDate(value);
}

export function ProductFormPage() {
  return (
    <TaxonomyGate>
      <ProductForm />
    </TaxonomyGate>
  );
}

function ProductForm() {
  const { id = '' } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const taxonomy = useTaxonomy();
  const firstFamily = taxonomy.families[0];
  const firstCategory = firstFamily.categories[0];
  const productQuery = useAsync(
    () => (editing ? productsApi.get(id) : Promise.resolve(null)),
    [editing, id],
  );
  const [familyId, setFamilyId] = useState(firstFamily.id);
  const [category, setCategory] = useState(firstCategory.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [list, setList] = useState('10');
  const [offer, setOffer] = useState('');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeUntil, setActiveUntil] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    taxonomy.emptyAttributes(firstCategory.id),
  );
  const [hydrated, setHydrated] = useState(!editing);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const family = taxonomy.getFamily(familyId);
  const categoryDef = taxonomy.getCategory(category);
  const categories = useMemo(() => family?.categories ?? [], [family]);

  useEffect(() => {
    if (!editing || !productQuery.data || hydrated) return;
    const product = productQuery.data;
    const nextCategory = taxonomy.getCategory(product.category);
    setFamilyId(nextCategory?.familyId ?? firstFamily.id);
    setCategory(product.category);
    setTitle(product.title);
    setDescription(product.description);
    setList(String(product.price.list ?? ''));
    setOffer(product.price.offer != null ? String(product.price.offer) : '');
    setActiveFrom(toDateInput(product.price.activeFrom));
    setActiveUntil(toDateInput(product.price.activeUntil));
    setValues({
      ...taxonomy.emptyAttributes(product.category),
      ...product.attributes,
    });
    setHydrated(true);
  }, [editing, productQuery.data, hydrated, taxonomy, firstFamily.id]);

  function onFamilyChange(nextFamily: string) {
    const next = taxonomy.getFamily(nextFamily)?.categories[0];
    setFamilyId(nextFamily);
    setCategory(next?.id ?? '');
    setValues(taxonomy.emptyAttributes(next?.id ?? ''));
  }

  function onCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    setValues(taxonomy.emptyAttributes(nextCategory));
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
      const attributes = taxonomy.attributesPayload(category, values);
      const product = editing
        ? await productsApi.update(id, {
            title,
            category,
            description,
            price,
            attributes,
          })
        : await productsApi.create({
            title,
            category,
            description,
            price: {
              list: Number(list),
              ...(offer
                ? { offer: Number(offer), activeFrom, activeUntil }
                : {}),
            },
            attributes,
          });
      navigate(`/app/products/${product.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (editing && (!hydrated || productQuery.loading)) {
    return <Spinner />;
  }
  if (editing && productQuery.error) {
    return <ErrorBanner message={errorMessage(productQuery.error)} />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to={editing ? `/app/products/${id}` : '/app/products'}
          className="text-sm font-semibold text-muted"
        >
          ← {editing ? 'Producto' : 'Productos'}
        </Link>
        <h1 className="mt-2 font-display text-4xl">
          {editing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {editing
            ? 'Corregí título, precio, oferta o atributos. Vaciar la oferta la quita al guardar.'
            : 'Elegí familia y categoría. Los atributos se arman según la categoría.'}
        </p>
      </div>
      <Card className="p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? <ErrorBanner message={error} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Familia"
              value={familyId}
              onChange={(e) => onFamilyChange(e.target.value)}
            >
              {taxonomy.families.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Select
              label="Categoría"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          {family?.description ? (
            <p className="text-xs text-muted">{family.description}</p>
          ) : null}
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
          <AttributeFields
            attributes={categoryDef?.attributes ?? []}
            values={values}
            onChange={(key, value) =>
              setValues((current) => ({ ...current, [key]: value }))
            }
          />
          <Button type="submit" loading={loading}>
            {editing ? 'Guardar cambios' : 'Guardar draft'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
