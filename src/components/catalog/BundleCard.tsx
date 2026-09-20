import { Link } from 'react-router-dom';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { mediaDisplayUrl } from '@/lib/media';
import type { Bundle } from '@/types/api';
import { Badge } from '../ui/Badge';
import { PriceTag } from './PriceTag';

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const { categoryLabel } = useTaxonomy();
  const covers = bundle.products
    .map((product) => mediaDisplayUrl(product.medias?.[0], 'thumbnail'))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link
      to={`/app/bundles/${bundle.id}`}
      className="group overflow-hidden rounded-[28px] border border-line bg-paper p-4 shadow-(--shadow-card) transition hover:-translate-y-0.5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Combo · {bundle.products.length} productos
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight">
            {bundle.title}
          </h3>
        </div>
        <Badge value={bundle.status} />
      </div>
      <div className="mb-4 flex -space-x-3">
        {covers.length ? (
          covers.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-14 w-14 rounded-2xl border-2 border-paper object-cover"
            />
          ))
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-sand" />
        )}
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-muted">
        {bundle.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {bundle.category
          .filter((item) => item !== 'bundle')
          .map((item) => (
            <span
              key={item}
              className="rounded-full bg-sand px-2 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {categoryLabel(item)}
            </span>
          ))}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <PriceTag price={bundle.price} />
      </div>
    </Link>
  );
}
