import { dayLabel } from '@/lib/format';
import type { ServiceSchedule } from '@/types/api';

export function ScheduleSummary({ schedule }: { schedule: ServiceSchedule }) {
  if (!schedule.available) {
    return <p className="mt-3 text-sm text-muted">No disponible.</p>;
  }
  if (schedule.available24h) {
    return <p className="mt-3 text-sm font-semibold">24/7</p>;
  }
  const entries = Object.entries(schedule.days ?? {});
  if (!entries.length) return null;
  return (
    <div className="mt-3 space-y-1 rounded-2xl bg-sand px-4 py-3 text-sm">
      {entries.map(([day, indexes]) => (
        <p key={day}>
          <strong>{dayLabel(day)}</strong>:{' '}
          {indexes.map((i) => schedule.timeRanges[i]).join(', ')}
        </p>
      ))}
    </div>
  );
}
