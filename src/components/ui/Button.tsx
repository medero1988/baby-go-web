import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';

const variants: Record<Variant, string> = {
  primary:
    'bg-terracotta text-white hover:bg-terracotta-dark shadow-[0_10px_24px_-12px_rgba(216,106,74,0.9)]',
  secondary: 'bg-paper text-ink border border-line hover:bg-white',
  ghost: 'bg-transparent text-ink-soft hover:bg-white/60',
  danger: 'bg-danger text-white hover:bg-red-800',
  dark: 'bg-ink text-paper hover:bg-black',
};

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  to?: string;
};

export function Button({
  variant = 'primary',
  loading,
  icon,
  className = '',
  children,
  disabled,
  to,
  ...props
}: Props) {
  const classes = `${baseClass} ${variants[variant]} ${className}`;
  const content = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        icon
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
