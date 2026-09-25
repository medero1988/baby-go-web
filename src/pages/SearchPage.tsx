import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Search, Truck, Store } from 'lucide-react';
import { searchApi } from '@/api/search';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { SearchItemCard } from '@/components/catalog/SearchItemCard';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { countryMeta } from '@/lib/countries';
import { errorMessage } from '@/lib/errors';
import { useSupportedCountries } from '@/lib/useSupportedCountries';
import type { SearchBody, SearchItem, SearchResponse } from '@/types/api';

const PAGE_SIZE = 20;

type DraftFilters = {
  country: string;
  city: string;
  category: string;
  start: string;
  end: string;
  handoff: '' | 'delivery' | 'customer_pickup';
};

const EMPTY_DRAFT: DraftFilters = {
  country: '',
  city: '',
  category: '',
  start: '',
  end: '',
  handoff: '',
};

function buildBody(draft: DraftFilters): SearchBody {
  const body: SearchBody = {};

  if (draft.country) {
    body.destination = {
      country: draft.country,
      ...(draft.city.trim() ? { city: draft.city.trim() } : {}),
    };
  }

  if (draft.category) {
    body.categories = [{ name: draft.category }];
  }

  if (draft.start && draft.end) {
    body.rentalPeriod = { start: draft.start, end: draft.end };
  }

  if (draft.handoff) {
    body.acquisition = { type: draft.handoff };
  }

  return body;
}

export function SearchPage() {
  const taxonomy = useTaxonomy();
  const { countries } = useSupportedCountries();
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<SearchBody>({});
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const categories = useMemo(
    () =>
      taxonomy.categories
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [taxonomy.categories],
  );

  const runSearch = useCallback(
    async (body: SearchBody, offset = 0, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const response: SearchResponse = await searchApi.search(body, {
          offset,
          limit: PAGE_SIZE,
        });
        setItems((prev) =>
          append ? [...prev, ...response.data] : response.data,
        );
        setTotal(response.total);
        setNextOffset(response.nextPage?.offset ?? null);
      } catch (err) {
        setError(err);
        if (!append) {
          setItems([]);
          setTotal(0);
          setNextOffset(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    void runSearch(applied, 0, false);
  }, [applied, runSearch]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setApplied(buildBody(draft));
  }

  function clearFilters() {
    setDraft(EMPTY_DRAFT);
    setApplied({});
  }

  const hasFilters = Object.keys(applied).length > 0;

  return (
    <div className="bg-grain min-h-screen">
      <PublicHeader active="search" />

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">
          Catálogo público
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
          Encontrá el equipo en tu destino
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ink-soft">
          Buscá sin cuenta. Cuando quieras alquilar, te pedimos login como
          cliente.
        </p>

        <form
          onSubmit={submitSearch}
          className="mt-8 rounded-[32px] border border-line bg-paper p-2 shadow-(--shadow-card) md:p-3"
        >
          <div className="grid gap-1 md:grid-cols-[1.2fr_1fr_1fr_auto]">
            <label className="rounded-[24px] px-4 py-3 transition hover:bg-sand/70">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Dónde
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                <select
                  className="min-w-[8rem] flex-1 bg-transparent text-sm font-semibold outline-none"
                  value={draft.country}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, country: e.target.value }))
                  }
                >
                  <option value="">Cualquier país</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <input
                  className="min-w-[7rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  placeholder="Ciudad o barrio"
                  value={draft.city}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
            </label>

            <label className="rounded-[24px] px-4 py-3 transition hover:bg-sand/70">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Fechas
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="date"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  value={draft.start}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, start: e.target.value }))
                  }
                />
                <span className="text-muted">→</span>
                <input
                  type="date"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  value={draft.end}
                  min={draft.start || undefined}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
              </div>
            </label>

            <label className="rounded-[24px] px-4 py-3 transition hover:bg-sand/70">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Qué
              </span>
              <select
                className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                value={draft.category}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">Todo el catálogo</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.familyLabel} · {category.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end p-2">
              <Button
                type="submit"
                className="w-full md:w-auto"
                icon={<Search size={16} />}
                loading={loading}
              >
                Buscar
              </Button>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line/70 px-3 py-3">
            <span className="text-xs font-semibold text-muted">Entrega</span>
            <HandoffChip
              active={!draft.handoff}
              onClick={() => setDraft((prev) => ({ ...prev, handoff: '' }))}
              label="Cualquiera"
            />
            <HandoffChip
              active={draft.handoff === 'delivery'}
              onClick={() =>
                setDraft((prev) => ({ ...prev, handoff: 'delivery' }))
              }
              icon={<Truck size={14} />}
              label="Delivery"
            />
            <HandoffChip
              active={draft.handoff === 'customer_pickup'}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  handoff: 'customer_pickup',
                }))
              }
              icon={<Store size={14} />}
              label="Retiro"
            />
            {hasFilters || draft.country || draft.category || draft.city ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs font-semibold text-terracotta hover:underline"
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        {loading ? <Spinner label="Buscando equipos" /> : null}
        {error ? <ErrorBanner message={errorMessage(error)} /> : null}

        {!loading && !error && items.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            body={
              hasFilters
                ? 'Probá otro destino, categoría o fechas.'
                : 'Todavía no hay productos activos en el catálogo público.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Ver todo
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!loading && items.length > 0 ? (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-muted">
                {total} resultado{total === 1 ? '' : 's'}
                {applied.destination?.country
                  ? ` en ${countryMeta(applied.destination.country).label}`
                  : ''}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <SearchItemCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
            {nextOffset != null ? (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  loading={loadingMore}
                  onClick={() => void runSearch(applied, nextOffset, true)}
                >
                  Cargar más
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function HandoffChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? 'bg-ink text-paper' : 'bg-sand text-ink-soft hover:bg-line/60'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
