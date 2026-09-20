import { createContext, useContext, type ReactNode } from 'react';
import type { Store } from '@/types/api';

export type StoreWorkspaceValue = {
  store: Store;
  onChange: (store: Store) => void;
};

const StoreWorkspaceContext = createContext<StoreWorkspaceValue | null>(null);

export function StoreWorkspaceProvider({
  value,
  children,
}: {
  value: StoreWorkspaceValue;
  children: ReactNode;
}) {
  return (
    <StoreWorkspaceContext.Provider value={value}>
      {children}
    </StoreWorkspaceContext.Provider>
  );
}

export function useStoreWorkspace() {
  const ctx = useContext(StoreWorkspaceContext);
  if (!ctx) {
    throw new Error('useStoreWorkspace debe usarse dentro de StorePage');
  }
  return ctx;
}
