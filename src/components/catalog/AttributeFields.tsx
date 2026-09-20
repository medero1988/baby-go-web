import { Input, Select, Toggle } from '@/components/ui/Field';
import type { AttributeDef } from '@/lib/taxonomy';

export function AttributeFields({
  attributes,
  values,
  onChange,
}: {
  attributes: AttributeDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  if (!attributes.length) return null;

  return (
    <div className="space-y-4 rounded-[28px] border border-line bg-sand/60 p-4">
      <div>
        <p className="text-sm font-semibold text-ink">Atributos</p>
        <p className="text-xs text-muted">
          Cambian según la categoría. El backend los guarda como objeto libre.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {attributes.map((attribute) => (
          <AttributeField
            key={attribute.key}
            attribute={attribute}
            value={values[attribute.key]}
            onChange={(value) => onChange(attribute.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function AttributeField({
  attribute,
  value,
  onChange,
}: {
  attribute: AttributeDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (attribute.type === 'boolean') {
    return (
      <div className="md:col-span-2">
        <Toggle
          label={attribute.label}
          checked={Boolean(value)}
          onChange={onChange}
        />
      </div>
    );
  }

  if (attribute.type === 'select') {
    return (
      <Select
        label={attribute.label}
        hint={attribute.hint}
        required={attribute.required}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
      >
        {!attribute.required ? (
          <option value="">Elegí una opción</option>
        ) : null}
        {attribute.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (attribute.type === 'number') {
    return (
      <Input
        label={`${attribute.label}${attribute.unit ? ` (${attribute.unit})` : ''}`}
        type="number"
        hint={attribute.hint}
        required={attribute.required}
        min={attribute.min}
        max={attribute.max}
        step={attribute.step ?? 1}
        value={value === '' || value == null ? '' : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (attribute.type === 'text') {
    return (
      <Input
        label={attribute.label}
        hint={attribute.hint}
        required={attribute.required}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (attribute.type === 'range') {
    const range = Array.isArray(value)
      ? value
      : [attribute.min ?? 0, attribute.max ?? 12];
    return (
      <div className="md:col-span-2">
        <p className="mb-1.5 text-sm font-semibold text-ink-soft">
          {attribute.label}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Desde"
            type="number"
            required={attribute.required}
            min={attribute.min}
            max={attribute.max}
            step={attribute.step ?? 1}
            value={String(range[0] ?? '')}
            onChange={(e) =>
              onChange([Number(e.target.value), Number(range[1])])
            }
          />
          <Input
            label="Hasta"
            type="number"
            required={attribute.required}
            min={attribute.min}
            max={attribute.max}
            step={attribute.step ?? 1}
            value={String(range[1] ?? '')}
            onChange={(e) =>
              onChange([Number(range[0]), Number(e.target.value)])
            }
          />
        </div>
        {attribute.hint ? (
          <p className="mt-1 text-xs text-muted">{attribute.hint}</p>
        ) : null}
      </div>
    );
  }

  const selected = Array.isArray(value) ? value : [];
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-semibold text-ink-soft">
        {attribute.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {attribute.options?.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                active
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-white text-ink-soft'
              }`}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== option.value)
                    : [...selected, option.value],
                )
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {attribute.hint ? (
        <p className="mt-1 text-xs text-muted">{attribute.hint}</p>
      ) : null}
    </div>
  );
}
