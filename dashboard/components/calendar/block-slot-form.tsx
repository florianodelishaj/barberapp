"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
import type { Barber, Profile, Service } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { X, Scissors, CalendarDays, Clock, Tag, Search } from "lucide-react";

interface BlockSlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (block: {
    barber_id: string;
    scheduled_at: string;
    duration_minutes: number;
    note: string;
    service_id?: string;
    user_id?: string;
    price: number;
  }) => Promise<void>;
  defaultDate?: Date;
}

type ClientProfile = Pick<Profile, "id" | "first_name" | "last_name" | "phone">;

const DURATIONS = [15, 30, 45, 60, 75, 90, 120];

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 20; h++) {
  for (const m of [0, 15, 30, 45]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}
TIME_OPTIONS.push("21:00");

function snapToSlot(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const totalMinutes = h * 60 + m;
  const snapped = Math.round(totalMinutes / 15) * 15;
  const sh = Math.min(Math.floor(snapped / 60), 21);
  const sm = snapped % 60;
  const candidate = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
  return TIME_OPTIONS.includes(candidate) ? candidate : TIME_OPTIONS[0];
}

export function BlockSlotForm({
  open,
  onOpenChange,
  onSubmit,
  defaultDate,
}: BlockSlotFormProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const now = defaultDate ?? new Date();
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(format(now, "yyyy-MM-dd"));
  const [time, setTime] = useState(snapToSlot(format(now, "HH:mm")));
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("barbers")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setBarbers((data as Barber[]) ?? []));
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setServices((data as Service[]) ?? []));
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone")
      .eq("status", "approved")
      .order("first_name")
      .then(({ data }) => setProfiles((data as ClientProfile[]) ?? []));
  }, [open]);

  function resetForm() {
    setBarberId("");
    setDate(format(defaultDate ?? new Date(), "yyyy-MM-dd"));
    setTime(snapToSlot(format(defaultDate ?? new Date(), "HH:mm")));
    setDuration(30);
    setNote("");
    setServiceId("");
    setClientId("");
    setClientSearch("");
    setShowDropdown(false);
    setConflictError("");
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  }

  const selectedClient = clientId ? profiles.find((p) => p.id === clientId) : null;

  const filteredProfiles =
    clientSearch.length > 0
      ? profiles
          .filter(
            (p) =>
              `${p.first_name} ${p.last_name}`
                .toLowerCase()
                .includes(clientSearch.toLowerCase()) ||
              p.phone?.includes(clientSearch)
          )
          .slice(0, 8)
      : [];

  function handleServiceChange(id: string) {
    setServiceId(id);
    if (id) {
      const svc = services.find((s) => s.id === id);
      if (svc) setDuration(svc.duration_minutes);
    }
  }

  function handleClientSelect(profile: ClientProfile) {
    setClientId(profile.id);
    setClientSearch("");
    setShowDropdown(false);
  }

  function clearClient() {
    setClientId("");
    setClientSearch("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barberId) return;
    setConflictError("");
    setLoading(true);

    // Check for overlapping appointments
    const newStart = new Date(`${date}T${time}:00`).getTime();
    const newEnd = newStart + duration * 60000;
    const dayStart = new Date(`${date}T00:00:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59`).toISOString();

    const { data: existing } = await supabase
      .from("appointments")
      .select("scheduled_at, duration_minutes")
      .eq("barber_id", barberId)
      .eq("status", "confirmed")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd);

    const hasConflict = existing?.some((a) => {
      const aStart = new Date(a.scheduled_at).getTime();
      const aEnd = aStart + a.duration_minutes * 60000;
      return newStart < aEnd && newEnd > aStart;
    });

    if (hasConflict) {
      setConflictError("Questo slot è già occupato per il barbiere selezionato.");
      setLoading(false);
      return;
    }

    const selectedService = serviceId ? services.find((s) => s.id === serviceId) : null;
    await onSubmit({
      barber_id: barberId,
      scheduled_at: new Date(`${date}T${time}:00`).toISOString(),
      duration_minutes: duration,
      note: note.trim(),
      service_id: serviceId || undefined,
      user_id: clientId || undefined,
      price: selectedService?.price ?? 0,
    });
    setLoading(false);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Blocca slot</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barbiere */}
          <div className="space-y-1.5">
            <Label>Barbiere *</Label>
            <Select value={barberId} onValueChange={(v) => { setBarberId(v ?? ""); setConflictError(""); }} required>
              <SelectTrigger icon={<Scissors size={15} />}>
                <span className={`flex flex-1 text-left text-sm ${!barberId ? "text-muted-foreground" : ""}`}>
                  {barberId ? barbers.find((b) => b.id === barberId)?.name : "Seleziona barbiere"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {barbers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e ora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setConflictError(""); }}
                required
                icon={<CalendarDays size={15} />}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ora *</Label>
              <select
                value={time}
                onChange={(e) => { setTime(e.target.value); setConflictError(""); }}
                required
                className="h-13.5 w-full rounded-[1.75rem] border border-white/10 bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors scheme-dark appearance-none cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {conflictError && (
            <p className="text-sm text-destructive">{conflictError}</p>
          )}

          {/* Durata (nascosta se servizio selezionato) */}
          {!serviceId && (
            <div className="space-y-1.5">
              <Label>Durata</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger icon={<Clock size={15} />}>
                  <span className="flex flex-1 text-left text-sm">{duration} min</span>
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cliente (opzionale) */}
          <div className="space-y-1.5">
            <Label>Cliente (opzionale)</Label>
            {selectedClient ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[1.75rem] border border-white/10 bg-card text-sm">
                <span className="flex-1 font-medium">
                  {selectedClient.first_name} {selectedClient.last_name}
                </span>
                {selectedClient.phone && (
                  <span className="text-muted-foreground text-xs">{selectedClient.phone}</span>
                )}
                <button
                  type="button"
                  onClick={clearClient}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <Input
                  placeholder="Cerca per nome o telefono…"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  autoComplete="off"
                  icon={<Search size={15} />}
                />
                {showDropdown && clientSearch.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-44 overflow-y-auto">
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => handleClientSelect(p)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
                        >
                          <span className="font-medium flex-1">
                            {p.first_name} {p.last_name}
                          </span>
                          {p.phone && (
                            <span className="text-muted-foreground text-xs">{p.phone}</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nessun cliente trovato</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nota */}
          <div className="space-y-1.5">
            <Label>Nota <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
            <Textarea
              placeholder="Es. Mario - taglio classico, Pausa pranzo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Servizio */}
          <div className="space-y-1.5">
            <Label>Servizio (opzionale)</Label>
            <Select value={serviceId} onValueChange={(v) => handleServiceChange(v ?? "")}>
              <SelectTrigger icon={<Tag size={15} />}>
                <span className={`flex flex-1 text-left text-sm ${!serviceId ? "text-muted-foreground" : ""}`}>
                  {serviceId
                    ? (() => {
                        const s = services.find((s) => s.id === serviceId);
                        return s ? `${s.name} (${s.duration_minutes} min)` : "";
                      })()
                    : "Nessun servizio"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nessun servizio</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !barberId}>
              {loading ? "Salvataggio..." : "Blocca slot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
