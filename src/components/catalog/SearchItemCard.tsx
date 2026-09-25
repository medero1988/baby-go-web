import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { countryMeta } from '@/lib/countries';
import { productCover } from '@/lib/media';
import type { SearchItem } from '@/types/api';
import { PriceTag } from './PriceTag';

export function SearchItemCard({ item }: { item: SearchItem }) {
  const { getCategory, categoryLabel } = useTaxonomy();
  const cover = productCover(item.medias);
  const primaryCategory = Array.isArray(item.category)
    ? (item.category.find((c) => c !== 'bundle') ?? 'bundle')
    : item.category;
  const family = getCategory(primaryCategory)?.familyLabel;
  const country = countryMeta(item.store.country);
  const place =
    item.store.address.addressLine2 ||
    item.store.address.addressLine1 ||
    country.label;

  return (
    <Link
      to={`/search/${item.kind}/${item.id}`}
      state={{ item }}
      className="group overflow-hidden rounded-[28px] border border-line bg-paper shadow-(--shadow-card) transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-sand">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin foto
          </div>
        )}
        {item.kind === 'bundle' ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink shadow-sm">
            <Package size={12} />
            Combo
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          {item.kind === 'bundle'
            ? `Combo · ${item.products?.length ?? 0} ítems`
            : `${family ? `${family} · ` : ''}${categoryLabel(primaryCategory)}`}
        </p>
        <h3 className="font-display text-xl leading-tight">{item.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">
            {item.store.name} · {place}
          </span>
        </p>
        <PriceTag price={item.price} />
      </div>
    </Link>
  );
}
