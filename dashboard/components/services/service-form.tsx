"use client";

import { useState } from "react";
import { X, Tag, Clock, Euro, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Service } from "@/lib/types";

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 120];

interface ServiceFormProps {
  service?: Service;
  onSave: (data: Omit<Service, "id" | "created_at" | "display_order">) => Promise<void>;
  onClose: () => void;
}

export function ServiceForm({ service, onSave, onClose }: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? "");
  const [duration, setDuration] = useState(service?.duration_minutes ?? 30);
  const [price, setPrice] = useState(service?.price?.toString() ?? "");
  const [iconName, setIconName] = useState(service?.icon_name ?? "");
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name: name.trim(),
      duration_minutes: duration,
      price: parseFloat(price) || 0,
      icon_name: iconName.trim() || null,
      is_active: isActive,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl w-full max-w-md border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {service ? "Modifica servizio" : "Nuovo servizio"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Taglio classico"
              icon={<Tag size={15} />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Durata</Label>
              <Select
                value={String(duration)}
                onValueChange={(v) => setDuration(Number(v))}
              >
                <SelectTrigger icon={<Clock size={15} />}>
                  <span className="flex flex-1 text-left text-sm">{duration} min</span>
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prezzo (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15"
                icon={<Euro size={15} />}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nome icona (Lucide)</Label>
            <Input
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="scissors"
              icon={<Smile size={15} />}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors ${
                isActive ? "bg-primary" : "bg-secondary"
              } relative shrink-0`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  isActive ? "left-4" : "left-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-muted-foreground">Servizio attivo</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1"
            >
              {saving ? "Salvataggio…" : "Salva"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
