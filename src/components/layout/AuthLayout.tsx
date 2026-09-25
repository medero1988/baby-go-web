import { TicketsPlane } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-grain min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-paper">
            <TicketsPlane size={20} />
          </div>
          <span className="font-display text-2xl">Flyfree</span>
        </Link>
        <div className="rounded-[32px] border border-line bg-paper p-6 shadow-(--shadow-card) md:p-8">
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
