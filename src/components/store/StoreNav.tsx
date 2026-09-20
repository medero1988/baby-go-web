import { NavLink } from 'react-router-dom';
import { Pencil, Store } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Store as StoreType } from '@/types/api';

export function StoreHeader({ store }: { store: StoreType }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Store 1:1
        </p>
        <h1 className="mt-1 font-display text-4xl">{store.name}</h1>
      </div>
      <Badge value={store.meta.state} />
    </div>
  );
}

export function StoreTabs() {
  const tabs = [
    { to: '/app/store', label: 'Información', icon: Store, end: true },
    { to: '/app/store/edit', label: 'Editar', icon: Pencil, end: false },
  ];

  return (
    <div className="flex gap-2 rounded-full bg-paper p-1 shadow-(--shadow-card)">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sand'
            }`
          }
        >
          <tab.icon size={16} />
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
