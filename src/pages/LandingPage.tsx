import { ArrowRight, Search, Bike, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { useAuth } from '@/auth/AuthProvider';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-grain min-h-screen">
      <PublicHeader active="home" />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">
            Alquiler de equipo bebé
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-7xl">
            Viajá liviano.
            <br />
            El cochecito te espera.
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-soft md:text-lg">
            Explorá el catálogo sin cuenta. Alquilá como cliente cuando estés
            listo, o gestioná tu tienda si sos provider.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/search" icon={<Search size={16} />}>
              Explorar catálogo
            </Button>
            {user ? (
              <Button to="/app" variant="secondary">
                Ir al panel
              </Button>
            ) : (
              <Button
                to="/register"
                variant="secondary"
                icon={<ArrowRight size={16} />}
              >
                Soy provider
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-gold/50 blur-2xl" />
          <div className="rounded-[40px] border border-line bg-paper p-6 shadow-(--shadow-card)">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Cómo funciona
            </p>
            <div className="mt-5 space-y-4">
              {[
                ['1. Buscá', 'Destino, fechas y tipo de equipo'],
                ['2. Elegí', 'Productos y combos de tiendas locales'],
                ['3. Alquilá', 'Login de cliente solo al confirmar'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-3xl bg-sand px-4 py-3">
                  <p className="font-semibold">{title}</p>
                  <p className="text-xs text-muted">{body}</p>
                </div>
              ))}
            </div>
            <Button to="/search" variant="dark" className="mt-5 w-full">
              Ver equipos disponibles
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {[
          {
            icon: Search,
            title: 'Para viajeros',
            body: 'Catálogo público con delivery o retiro. Sin login para mirar.',
          },
          {
            icon: Package,
            title: 'Para providers',
            body: 'Tienda, productos, combos y Stripe Connect desde el panel.',
          },
          {
            icon: Bike,
            title: 'Misma web',
            body: 'Un provider también puede alquilar como cliente cuando viaja.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-line bg-paper p-6"
          >
            <item.icon className="text-terracotta" />
            <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      {!user ? (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex flex-col items-start justify-between gap-4 rounded-[32px] border border-line bg-paper px-6 py-8 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                <Shield size={14} />
                Providers
              </p>
              <h2 className="mt-2 font-display text-3xl">
                ¿Querés publicar tu catálogo?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Creá cuenta, configurá la tienda y publicá productos activos.
                Aparecen en el search público.
              </p>
            </div>
            <Button to="/register" icon={<ArrowRight size={16} />}>
              Empezar como provider
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
