"use client";

import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BarberException } from "@/lib/types";

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 15, 30, 45]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  }
}

interface ExceptionsEditorProps {
  barberId: string;
  exceptions: BarberException[];
  onAdd: (payload: Omit<BarberException, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ExceptionsEditor({
  barberId,
  exceptions,
  onAdd,
  onDelete,
}: ExceptionsEditorProps) {
  const [date, setDate] = useState("");
  const [isOff, setIsOff] = useState(true);
  const [customStart, setCustomStart] = useState("09:00:00");
  const [customEnd, setCustomEnd] = useState("18:00:00");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!date) return;
    setAdding(true);
    await onAdd({
      barber_id: barberId,
      date,
      is_off: isOff,
      custom_start: isOff ? null : customStart,
      custom_end: isOff ? null : customEnd,
    });
    setDate("");
    setAdding(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Eccezioni</h3>

      {/* Add form */}
      <div className="flex flex-wrap gap-3 items-end mb-5 p-4 bg-background rounded-lg border border-border">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors scheme-dark"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
          <div className="flex gap-2">
            {[
              { v: true, label: "Giorno libero" },
              { v: false, label: "Orario custom" },
            ].map(({ v, label }) => (
              <button
                key={String(v)}
                onClick={() => setIsOff(v)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  isOff === v
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!isOff && (
          <>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Da</label>
              <select
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-card border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors scheme-dark"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">A</label>
              <select
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-card border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary transition-colors scheme-dark"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <Button
          onClick={handleAdd}
          disabled={!date || adding}
        >
          <Plus size={15} className="mr-1" />
          Aggiungi
        </Button>
      </div>

      {/* List */}
      {exceptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna eccezione impostata</p>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exc) => (
            <div
              key={exc.id}
              className="flex items-center justify-between px-4 py-3 bg-background rounded-lg border border-border"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(exc.date + "T00:00:00"), "EEEE d MMMM yyyy", {
                    locale: it,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exc.is_off
                    ? "Giorno libero"
                    : `Orario: ${exc.custom_start?.slice(0, 5)} — ${exc.custom_end?.slice(0, 5)}`}
                </p>
              </div>
              <button
                onClick={() => onDelete(exc.id)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
