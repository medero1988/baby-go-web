import { ArrowRight, Baby, Bike, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthProvider';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="bg-grain min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-paper">
            <Baby size={20} />
          </div>
          <span className="font-display text-2xl">Baby Go</span>
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
            Panel para providers: tienda, catálogo, combos y pagos Stripe.
            Consume las APIs de Baby Go en local.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/register" icon={<ArrowRight size={16} />}>
              Empezar como provider
            </Button>
            <Button to="/login" variant="secondary">
              Ya tengo cuenta
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-gold/50 blur-2xl" />
          <div className="rounded-[40px] border border-line bg-paper p-6 shadow-(--shadow-card)">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Hoy en el catálogo
            </p>
            <div className="mt-5 space-y-4">
              {[
                ['Maxy-cosi Rainbow', 'Cochecito', '€10 / día'],
                ['City Cruiser Kids', 'Bici', '€15 / día'],
                ['Duo Bugaboo', 'Combo', '€26 / día'],
              ].map(([title, tag, price]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-3xl bg-sand px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted">{tag}</p>
                  </div>
                  <p className="font-display text-xl">{price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {[
          {
            icon: Package,
            title: 'Catálogo',
            body: 'Productos con fotos, atributos libres y ofertas por fecha.',
          },
          {
            icon: Bike,
            title: 'Combos',
            body: 'Armá bundles de 2 a 10 productos activos de tu tienda.',
          },
          {
            icon: Shield,
            title: 'Stripe Connect',
            body: 'Onboarding de store, payouts y movimientos del provider.',
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
    </div>
  );
}
