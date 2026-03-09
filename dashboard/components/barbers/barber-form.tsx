"use client";

import { useState } from "react";
import { X, Check, User, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Barber } from "@/lib/types";

const PALETTE = [
  "#FA3D3B",
  "#4CD98A",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

interface BarberFormProps {
  barber?: Barber;
  onSave: (data: { name: string; bio: string; avatar_url: string | null; color: string }) => Promise<void>;
  onClose: () => void;
}

export function BarberForm({ barber, onSave, onClose }: BarberFormProps) {
  const [name, setName] = useState(barber?.name ?? "");
  const [bio, setBio] = useState(barber?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(barber?.avatar_url ?? "");
  const [color, setColor] = useState(barber?.color ?? PALETTE[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name: name.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl.trim() || null,
      color,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl w-full max-w-md border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {barber ? "Modifica barbiere" : "Nuovo barbiere"}
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
              placeholder="Marco Rossi"
              icon={<User size={15} />}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Breve descrizione…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>URL foto profilo</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              icon={<Link2 size={15} />}
            />
          </div>

          <div className="space-y-2">
            <Label>Colore calendario</Label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-card"
                  style={{
                    backgroundColor: c,
                    ringColor: color === c ? c : "transparent",
                  }}
                >
                  {color === c && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 text-white"
              style={{ backgroundColor: color }}
            >
              {saving ? "Salvataggio…" : "Salva"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
