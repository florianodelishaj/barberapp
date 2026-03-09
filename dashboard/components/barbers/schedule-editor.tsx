"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BarberSchedule } from "@/lib/types";

const DAYS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 15, 30, 45]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  }
}

type ScheduleRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

interface ScheduleEditorProps {
  barberId: string;
  schedules: BarberSchedule[];
  onSave: (rows: Omit<BarberSchedule, "id">[]) => Promise<void>;
}

export function ScheduleEditor({ barberId, schedules, onSave }: ScheduleEditorProps) {
  const initialRows = (): ScheduleRow[] =>
    DAYS.map((_, i) => {
      const existing = schedules.find((s) => s.day_of_week === i);
      return {
        day_of_week: i,
        start_time: existing?.start_time ?? "09:00:00",
        end_time: existing?.end_time ?? "18:00:00",
        is_active: existing?.is_active ?? (i >= 1 && i <= 6),
      };
    });

  const [rows, setRows] = useState<ScheduleRow[]>(initialRows);
  const [saving, setSaving] = useState(false);

  function update(dayIndex: number, patch: Partial<ScheduleRow>) {
    setRows((prev) =>
      prev.map((r) => (r.day_of_week === dayIndex ? { ...r, ...patch } : r))
    );
  }

  async function handleSave() {
    setSaving(true);
    const activeRows = rows
      .filter((r) => r.is_active)
      .map((r) => ({ ...r, barber_id: barberId }));
    await onSave(activeRows);
    setSaving(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Orari settimanali</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.day_of_week}
            className={`flex items-center gap-4 ${
              !row.is_active ? "opacity-40" : ""
            }`}
          >
            {/* Toggle */}
            <label className="flex items-center gap-2 w-20 cursor-pointer">
              <input
                type="checkbox"
                checked={row.is_active}
                onChange={(e) =>
                  update(row.day_of_week, { is_active: e.target.checked })
                }
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors ${
                  row.is_active ? "bg-primary" : "bg-secondary"
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    row.is_active ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-foreground">
                {DAYS[row.day_of_week]}
              </span>
            </label>

            {/* Time selects */}
            <select
              value={row.start_time}
              disabled={!row.is_active}
              onChange={(e) => update(row.day_of_week, { start_time: e.target.value })}
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors scheme-dark"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.slice(0, 5)}
                </option>
              ))}
            </select>

            <span className="text-muted-foreground text-sm">—</span>

            <select
              value={row.end_time}
              disabled={!row.is_active}
              onChange={(e) => update(row.day_of_week, { end_time: e.target.value })}
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors scheme-dark"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.slice(0, 5)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="mt-5"
      >
        <Save size={15} className="mr-2" />
        {saving ? "Salvataggio…" : "Salva orari"}
      </Button>
    </div>
  );
}
