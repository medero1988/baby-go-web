import type { DeliveryDayKey } from '@/types/api';

export const WEEK_DAYS: { key: DeliveryDayKey; label: string }[] = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

const DAY_LABELS: Record<string, string> = Object.fromEntries(
  WEEK_DAYS.map((day) => [day.key, day.label]),
);

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function centsToEuroInput(cents?: number): string {
  if (cents == null) return '';
  return String(cents / 100);
}

export function eurosFromList(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function eurosFromCents(cents: number, currency = 'eur'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const iso = value.includes('/') ? toIsoDate(value) : value.slice(0, 10);
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toIsoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function dayLabel(key: string): string {
  return DAY_LABELS[key] ?? key;
}

export function initials(name?: string, lastName?: string): string {
  const a = name?.trim().charAt(0) ?? '';
  const b = lastName?.trim().charAt(0) ?? '';
  return (a + b).toUpperCase() || 'BG';
}
