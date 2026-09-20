import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { Outlet } from 'react-router-dom';
import { settingsApi } from '@/api/settings';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { useAsync } from '@/lib/useAsync';
import {
  createTaxonomy,
  emptyTaxonomy,
  parseTaxonomy,
  type Taxonomy,
} from '@/lib/taxonomy';

type TaxonomyState = Taxonomy & {
  loading: boolean;
  error: unknown;
  ready: boolean;
  reload: () => Promise<void>;
};

const TaxonomyContext = createContext<TaxonomyState>({
  ...emptyTaxonomy(),
  loading: true,
  error: null,
  ready: false,
  reload: async () => undefined,
});

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const query = useAsync(() => settingsApi.productTaxonomy(), []);
  const taxonomy = useMemo(
    () => createTaxonomy(parseTaxonomy(query.data?.value)),
    [query.data],
  );

  const value = useMemo<TaxonomyState>(
    () => ({
      ...taxonomy,
      loading: query.loading,
      error: query.error,
      ready: !query.loading && !query.error && taxonomy.families.length > 0,
      reload: query.reload,
    }),
    [taxonomy, query.loading, query.error, query.reload],
  );

  return (
    <TaxonomyContext.Provider value={value}>
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy(): TaxonomyState {
  return useContext(TaxonomyContext);
}

/** Refresca familias/categorías al entrar a Productos (pueden cambiar en settings). */
export function ProductsTaxonomyLayout() {
  const { reload } = useTaxonomy();

  useEffect(() => {
    void reload();
  }, [reload]);

  return <Outlet />;
}

export function TaxonomyGate({ children }: { children: ReactNode }) {
  const taxonomy = useTaxonomy();
  if (taxonomy.loading) return <Spinner label="Cargando catálogo" />;
  if (taxonomy.error) {
    return <ErrorBanner message={errorMessage(taxonomy.error)} />;
  }
  if (!taxonomy.families.length) {
    return (
      <ErrorBanner message="No hay categorías disponibles para crear productos." />
    );
  }
  return children;
}
