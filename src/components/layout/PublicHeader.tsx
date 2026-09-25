import { Link } from 'react-router-dom';
import { TicketsPlane } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/Button';

export function PublicHeader({ active }: { active?: 'home' | 'search' }) {
  const { user } = useAuth();

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-paper">
            <TicketsPlane size={20} />
          </div>
          <span className="font-display text-2xl">Flyfree</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink to="/search" active={active === 'search'}>
            Explorar
          </NavLink>
          <NavLink to="/" active={active === 'home'}>
            Inicio
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <Button to="/app" variant="dark">
            Ir al panel
          </Button>
        ) : (
          <>
            <Button to="/login" variant="ghost">
              Entrar
            </Button>
            <Button to="/register">Crear cuenta</Button>
          </>
        )}
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active?: boolean;
  children: string;
}) {
  return (
    <Link
      to={to}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? 'bg-ink text-paper'
          : 'text-ink-soft hover:bg-white/70 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
