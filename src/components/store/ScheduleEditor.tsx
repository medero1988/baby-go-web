import { FormEvent, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Field';
import { WEEK_DAYS } from '@/lib/format';
import type {
  DeliveryDayKey,
  DeliveryDaysMap,
  ServiceSchedule,
  UpdateScheduleInput,
} from '@/types/api';

const DEFAULT_RANGES = ['7:30-9:30', '12:30-14:00', '17:30-19:00'];

type Props = {
  initial?: ServiceSchedule;
  maxPerDay: number;
  loading?: boolean;
  submitLabel: string;
  onSave: (body: UpdateScheduleInput) => Promise<void>;
};

export function ScheduleEditor({
  initial,
  maxPerDay,
  loading,
  submitLabel,
  onSave,
}: Props) {
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [available24h, setAvailable24h] = useState(
    initial?.available24h ?? false,
  );
  const [timeRanges, setTimeRanges] = useState(
    initial?.timeRanges?.length ? initial.timeRanges : DEFAULT_RANGES,
  );
  const [days, setDays] = useState<DeliveryDaysMap>(initial?.days ?? {});

  function toggleRange(day: DeliveryDayKey, index: number) {
    setDays((current) => {
      const selected = current[day] ?? [];
      if (selected.includes(index)) {
        const next = selected.filter((item) => item !== index);
        const copy = { ...current };
        if (next.length) copy[day] = next;
        else delete copy[day];
        return copy;
      }
      if (selected.length >= maxPerDay) return current;
      return { ...current, [day]: [...selected, index].sort((a, b) => a - b) };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!available) {
      await onSave({ available: false });
      return;
    }
    if (available24h) {
      await onSave({ available: true, available24h: true });
      return;
    }
    const ranges = timeRanges.map((item) => item.trim()).filter(Boolean);
    await onSave({ available: true, timeRanges: ranges, days });
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      <Toggle label="Disponible" checked={available} onChange={setAvailable} />
      {available ? (
        <Toggle
          label="24/7"
          checked={available24h}
          onChange={setAvailable24h}
        />
      ) : null}

      {available && !available24h ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink-soft">
              Franjas horarias
            </p>
            {timeRanges.map((range, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm"
                  placeholder="7:30-9:30"
                  value={range}
                  onChange={(e) =>
                    setTimeRanges((current) =>
                      current.map((item, i) =>
                        i === index ? e.target.value : item,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="rounded-2xl border border-line px-3 text-muted hover:text-danger"
                  onClick={() =>
                    setTimeRanges((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta"
              onClick={() => setTimeRanges((current) => [...current, ''])}
            >
              <Plus size={14} />
              Agregar franja
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">
              Días · máx {maxPerDay} franjas
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr>
                    <th className="pb-2 font-semibold text-muted">Día</th>
                    {timeRanges.map((range, index) => (
                      <th key={index} className="pb-2 font-semibold text-muted">
                        {range || `Franja ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEEK_DAYS.map((day) => (
                    <tr key={day.key} className="border-t border-line">
                      <td className="py-2 font-semibold">{day.label}</td>
                      {timeRanges.map((_, index) => {
                        const selected =
                          days[day.key]?.includes(index) ?? false;
                        const full =
                          !selected &&
                          (days[day.key]?.length ?? 0) >= maxPerDay;
                        return (
                          <td key={index} className="py-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={full}
                              onChange={() => toggleRange(day.key, index)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </form>
  );
}
