import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-line bg-paper shadow-(--shadow-card) ${className}`}
    >
      {children}
    </div>
  );
}
