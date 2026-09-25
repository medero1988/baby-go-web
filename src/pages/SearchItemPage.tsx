import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Store, Truck } from 'lucide-react';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PriceTag } from '@/components/catalog/PriceTag';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { countryMeta } from '@/lib/countries';
import { mediaDisplayUrl, productCover } from '@/lib/media';
import type { SearchItem } from '@/types/api';

export function SearchItemPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const location = useLocation();
  const taxonomy = useTaxonomy();
  const item = (location.state as { item?: SearchItem } | null)?.item;

  if (!item || item.id !== id || item.kind !== kind) {
    return (
      <div className="bg-grain min-h-screen">
        <PublicHeader active="search" />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="Ítem no disponible"
            body="Abrí el detalle desde el catálogo. El alquiler online llega pronto."
            action={<Button to="/search">Volver a explorar</Button>}
          />
        </div>
      </div>
    );
  }

  const primaryCategory = Array.isArray(item.category)
    ? (item.category.find((c) => c !== 'bundle') ?? 'bundle')
    : item.category;
  const cover = productCover(item.medias);
  const gallery = item.medias
    .map((media) => mediaDisplayUrl(media, 'detail'))
    .filter(Boolean);
  const country = countryMeta(item.store.country);
  const place =
    [item.store.address.addressLine1, item.store.address.addressLine2]
      .filter(Boolean)
      .join(', ') || country.label;

  return (
    <div className="bg-grain min-h-screen">
      <PublicHeader active="search" />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-4">
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-[32px] border border-line bg-sand aspect-[4/3]">
              {cover ? (
                <img
                  src={cover}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">
                  Sin foto
                </div>
              )}
            </div>
            {gallery.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.slice(0, 6).map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-20 w-28 shrink-0 rounded-2xl border border-line object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {item.kind === 'bundle'
                ? 'Combo'
                : taxonomy.categoryLabel(primaryCategory)}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight">
              {item.title}
            </h1>
            <p className="mt-4 text-ink-soft">{item.description}</p>
            <div className="mt-6">
              <PriceTag price={item.price} />
            </div>

            {item.kind === 'bundle' && item.products?.length ? (
              <div className="mt-6 rounded-[24px] border border-line bg-paper p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Package size={16} />
                  Incluye {item.products.length} productos
                </p>
                <ul className="mt-3 space-y-2">
                  {item.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>{product.title}</span>
                      <span className="text-muted">
                        {taxonomy.categoryLabel(product.category)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 rounded-[24px] border border-line bg-paper p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MapPin size={16} />
                {item.store.name}
              </p>
              <p className="mt-1 text-sm text-muted">
                {place} · {country.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.store.delivery?.available ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold">
                    <Truck size={12} />
                    Delivery
                  </span>
                ) : null}
                {item.store.customerPickup?.available ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold">
                    <Store size={12} />
                    Retiro
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                className="w-full"
                disabled
                title="API de alquiler pendiente"
              >
                Alquilar (próximamente)
              </Button>
              <p className="text-center text-xs text-muted">
                El checkout de alquiler se conecta cuando esté la API. Mientras
                tanto podés explorar el catálogo sin cuenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
