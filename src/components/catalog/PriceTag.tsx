import { eurosFromList } from '@/lib/format';
import type { ProductPrice } from '@/types/api';

export function PriceTag({ price }: { price: ProductPrice }) {
  const hasOffer = typeof price.offer === 'number' && price.offer < price.list;

  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl">
        {eurosFromList(hasOffer ? price.offer! : price.list)}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        / día
      </span>
      {hasOffer ? (
        <span className="text-sm text-muted line-through">
          {eurosFromList(price.list)}
        </span>
      ) : null}
    </div>
  );
}
