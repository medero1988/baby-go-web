import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  className = '',
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </span>
      <input
        className={`w-full rounded-2xl border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = '',
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </span>
      <textarea
        className={`w-full rounded-2xl border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-sand px-3.5 py-3">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-terracotta' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function Select({
  label,
  hint,
  error,
  className = '',
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </span>
      <select
        className={`w-full rounded-2xl border bg-white px-3.5 py-2.5 text-sm text-ink ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
