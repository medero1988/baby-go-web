import { Link } from 'react-router-dom';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { productCover } from '@/lib/media';
import type { Product } from '@/types/api';
import { Badge } from '../ui/Badge';
import { PriceTag } from './PriceTag';

export function ProductCard({ product }: { product: Product }) {
  const { getCategory, categoryLabel } = useTaxonomy();
  const cover = productCover(product.medias);

  return (
    <Link
      to={`/app/products/${product.id}`}
      className="group overflow-hidden rounded-[28px] border border-line bg-paper shadow-(--shadow-card) transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-sand">
        {cover ? (
          <img
            src={cover}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin foto
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge value={product.status} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          {getCategory(product.category)?.familyLabel
            ? `${getCategory(product.category)?.familyLabel} · `
            : ''}
          {categoryLabel(product.category)}
        </p>
        <h3 className="font-display text-xl leading-tight">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <PriceTag price={product.price} />
      </div>
    </Link>
  );
}
