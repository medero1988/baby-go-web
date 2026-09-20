import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { TaxonomyGate, useTaxonomy } from '@/catalog/TaxonomyProvider';
import { AttributeFields } from '@/components/catalog/AttributeFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';

export function ProductFormPage() {
  return (
    <TaxonomyGate>
      <ProductForm />
    </TaxonomyGate>
  );
}

function ProductForm() {
  const navigate = useNavigate();
  const taxonomy = useTaxonomy();
  const firstFamily = taxonomy.families[0];
  const firstCategory = firstFamily.categories[0];
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const family = taxonomy.getFamily(familyId);
  const categoryDef = taxonomy.getCategory(category);
  const categories = useMemo(() => family?.categories ?? [], [family]);

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
      const product = await productsApi.create({
        title,
        category,
        description,
        price: {
          list: Number(list),
          ...(offer ? { offer: Number(offer), activeFrom, activeUntil } : {}),
        },
        attributes: taxonomy.attributesPayload(category, values),
      });
      navigate(`/app/products/${product.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/app/products" className="text-sm font-semibold text-muted">
          ← Productos
        </Link>
        <h1 className="mt-2 font-display text-4xl">Nuevo producto</h1>
        <p className="mt-2 text-sm text-muted">
          Elegí familia y categoría. Los atributos se arman según la categoría.
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
            Guardar draft
          </Button>
        </form>
      </Card>
    </div>
  );
}
