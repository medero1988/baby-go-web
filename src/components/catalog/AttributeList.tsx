import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { formatAttributeValue, type AttributeDef } from '@/lib/taxonomy';

export function AttributeList({
  categoryId,
  attributes,
}: {
  categoryId: string;
  attributes: Record<string, unknown>;
}) {
  const { getCategory } = useTaxonomy();
  const defs = getCategory(categoryId)?.attributes ?? [];
  const known = new Set(defs.map((item) => item.key));
  const extras = Object.keys(attributes ?? {}).filter((key) => !known.has(key));

  if (!defs.length && !extras.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-3xl bg-sand p-4 text-sm">
      {defs.map((def) => (
        <div key={def.key}>
          <dt className="text-muted">{def.label}</dt>
          <dd className="font-semibold">
            {formatAttributeValue(def, attributes?.[def.key])}
          </dd>
        </div>
      ))}
      {extras.map((key) => (
        <div key={key}>
          <dt className="text-muted">{key}</dt>
          <dd className="font-semibold">
            {formatLoose(
              attributes[key],
              defs.find((item) => item.key === key),
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatLoose(value: unknown, def?: AttributeDef): string {
  if (def) return formatAttributeValue(def, value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value ?? '—');
}
