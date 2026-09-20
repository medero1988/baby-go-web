import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Baby,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { initials } from '@/lib/format';

const NAV = [
  { to: '/app', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/app/store', label: 'Tienda', icon: Store },
  { to: '/app/products', label: 'Productos', icon: Package },
  { to: '/app/bundles', label: 'Combos', icon: Boxes },
  { to: '/app/movements', label: 'Movimientos', icon: Wallet },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sand lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex min-h-full flex-col bg-ink text-paper">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta">
            <Baby size={20} />
          </div>
          <div>
            <p className="font-display text-xl leading-none">Baby Go</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
              Provider
            </p>
          </div>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden px-4 pb-6 lg:block">
          <div className="rounded-3xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-sm font-bold">
                  {initials(user?.name, user?.lastName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.name} {user?.lastName}
                </p>
                <p className="truncate text-xs text-white/50">{user?.email}</p>
              </div>
            </div>
            <button
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/15"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </aside>
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <p className="font-display text-lg">Baby Go</p>
          <button
            className="text-sm font-semibold text-muted"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Salir
          </button>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
