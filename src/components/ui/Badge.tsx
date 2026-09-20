import type { ProductStatus, StoreState } from '@/types/api';

const statusStyles: Record<string, string> = {
  draft: 'bg-gold/30 text-ink',
  active: 'bg-sage/15 text-sage',
  inactive: 'bg-line text-muted',
  'missing-info': 'bg-gold/35 text-ink',
  'pending-review': 'bg-terracotta/15 text-terracotta-dark',
};

const statusLabel: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  inactive: 'Inactivo',
  'missing-info': 'Falta info',
  'pending-review': 'En revisión',
};

export function Badge({
  value,
}: {
  value: ProductStatus | StoreState | string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        statusStyles[value] ?? 'bg-line text-ink-soft'
      }`}
    >
      {statusLabel[value] ?? value}
    </span>
  );
}
