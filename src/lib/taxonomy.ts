export type AttributeOption = {
  value: string;
  label: string;
};

export type AttributeDef = {
  key: string;
  label: string;
  type: 'boolean' | 'number' | 'text' | 'select' | 'multi' | 'range';
  required?: boolean;
  hint?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: AttributeOption[];
};

export type CategoryDef = {
  id: string;
  label: string;
  attributes: AttributeDef[];
};

export type FamilyDef = {
  id: string;
  label: string;
  description: string;
  categories: CategoryDef[];
};

export type CategoryWithFamily = CategoryDef & {
  familyId: string;
  familyLabel: string;
};

export type Taxonomy = {
  families: FamilyDef[];
  categories: CategoryWithFamily[];
  getFamily: (id: string) => FamilyDef | undefined;
  getCategory: (id: string) => CategoryWithFamily | undefined;
  categoryLabel: (id: string) => string;
  familyLabel: (id: string) => string;
  emptyAttributes: (categoryId: string) => Record<string, unknown>;
  attributesPayload: (
    categoryId: string,
    values: Record<string, unknown>,
  ) => Record<string, unknown>;
};

const EMPTY_TAXONOMY = createTaxonomy([]);

export function parseTaxonomy(value: unknown): FamilyDef[] {
  if (!value || typeof value !== 'object') return [];
  const families = (value as { families?: unknown }).families;
  if (!Array.isArray(families)) return [];
  return families.filter(isFamily);
}

function isFamily(item: unknown): item is FamilyDef {
  if (!item || typeof item !== 'object') return false;
  const family = item as FamilyDef;
  return Boolean(family.id && family.label && Array.isArray(family.categories));
}

export function createTaxonomy(families: FamilyDef[]): Taxonomy {
  const categories: CategoryWithFamily[] = families.flatMap((family) =>
    family.categories.map((category) => ({
      ...category,
      familyId: family.id,
      familyLabel: family.label,
    })),
  );

  function getFamily(id: string) {
    return families.find((item) => item.id === id);
  }

  function getCategory(id: string) {
    return categories.find((item) => item.id === id);
  }

  return {
    families,
    categories,
    getFamily,
    getCategory,
    categoryLabel: (id) => getCategory(id)?.label ?? id,
    familyLabel: (id) => getFamily(id)?.label ?? id,
    emptyAttributes: (categoryId) => emptyAttributes(getCategory(categoryId)),
    attributesPayload: (categoryId, values) =>
      attributesPayload(getCategory(categoryId), values),
  };
}

export function emptyTaxonomy(): Taxonomy {
  return EMPTY_TAXONOMY;
}

function emptyAttributes(category?: CategoryDef): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const attribute of category?.attributes ?? []) {
    values[attribute.key] = defaultAttributeValue(attribute);
  }
  return values;
}

export function defaultAttributeValue(attribute: AttributeDef): unknown {
  switch (attribute.type) {
    case 'boolean':
      return false;
    case 'number':
      return '';
    case 'text':
      return '';
    case 'select':
      return attribute.required ? (attribute.options?.[0]?.value ?? '') : '';
    case 'multi':
      return [];
    case 'range':
      return [attribute.min ?? 0, Math.min(attribute.max ?? 12, 12)];
    default:
      return '';
  }
}

function attributesPayload(
  category: CategoryDef | undefined,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const attribute of category?.attributes ?? []) {
    const value = values[attribute.key];
    if (isEmptyAttribute(attribute, value)) {
      if (attribute.required) payload[attribute.key] = value;
      continue;
    }
    if (attribute.type === 'number') {
      payload[attribute.key] = Number(value);
      continue;
    }
    if (attribute.type === 'range' && Array.isArray(value)) {
      payload[attribute.key] = value.map((item) => Number(item));
      continue;
    }
    payload[attribute.key] = value;
  }
  return payload;
}

function isEmptyAttribute(attribute: AttributeDef, value: unknown): boolean {
  if (attribute.type === 'boolean') return false;
  if (attribute.type === 'multi')
    return !Array.isArray(value) || value.length === 0;
  if (attribute.type === 'number') return value === '' || value == null;
  if (attribute.type === 'range') {
    return (
      !Array.isArray(value) || value.some((item) => item === '' || item == null)
    );
  }
  return value === '' || value == null;
}

export function formatAttributeValue(
  attribute: AttributeDef,
  value: unknown,
): string {
  if (value == null || value === '') return '—';
  if (attribute.type === 'boolean') return value ? 'Sí' : 'No';
  if (attribute.type === 'multi' && Array.isArray(value)) {
    return value
      .map(
        (item) =>
          attribute.options?.find((option) => option.value === item)?.label ??
          String(item),
      )
      .join(', ');
  }
  if (attribute.type === 'select') {
    return (
      attribute.options?.find((option) => option.value === value)?.label ??
      String(value)
    );
  }
  if (attribute.type === 'range' && Array.isArray(value)) {
    return `${value[0]} – ${value[1]}${attribute.unit ? ` ${attribute.unit}` : ''}`;
  }
  return `${value}${attribute.unit ? ` ${attribute.unit}` : ''}`;
}
