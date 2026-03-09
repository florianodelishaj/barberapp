"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Clock,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useIsOwner } from "@/contexts/auth-context";
import type { Profile, Appointment, UserStatus } from "@/lib/types";

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "In attesa",
  approved: "Approvato",
  rejected: "Rifiutato",
};

const APT_STATUS_LABEL: Record<string, string> = {
  confirmed: "Confermato",
  completed: "Completato",
  cancelled: "Cancellato",
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isOwner = useIsOwner();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [{ data: p }, { data: apts }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase
          .from("appointments")
          .select(`*, barber:barbers(name), service:services(name, price)`)
          .eq("user_id", id)
          .order("scheduled_at", { ascending: false }),
      ]);

      if (p) setProfile(p as Profile);
      if (apts) setAppointments(apts as Appointment[]);
      setLoading(false);
    }

    load();
  }, [id]);

  async function updateStatus(status: UserStatus) {
    if (!profile) return;
    await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setProfile({ ...profile, status });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Caricamento…
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-muted-foreground">Cliente non trovato.</div>;
  }

  const totalSpent = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.price, 0);

  const lastVisit = appointments.find((a) => a.status === "completed");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Clienti
      </button>

      {/* Profile card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="mt-2 space-y-1">
              {profile.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail size={14} />
                  {profile.email}
                </p>
              )}
              {profile.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone size={14} />
                  {profile.phone}
                </p>
              )}
              {profile.birth_date && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar size={14} />
                  {format(new Date(profile.birth_date), "d MMMM yyyy", { locale: it })}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge variant={profile.status as any}>
              {STATUS_LABEL[profile.status]}
            </Badge>
            {isOwner && profile.status !== "approved" && (
              <Button
                size="sm"
                className="bg-success/20 text-success hover:bg-success/30 border border-success/30"
                onClick={() => updateStatus("approved")}
              >
                <Check size={14} />
                Approva
              </Button>
            )}
            {isOwner && profile.status === "pending" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus("rejected")}
              >
                <X size={14} />
                Rifiuta
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Appuntamenti
          </p>
          <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Totale speso
          </p>
          <p className="text-2xl font-bold text-foreground">
            €{totalSpent % 1 === 0 ? totalSpent.toFixed(0) : totalSpent.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Ultima visita
          </p>
          <p className="text-sm font-semibold text-foreground mt-1">
            {lastVisit
              ? format(new Date(lastVisit.scheduled_at), "d MMM yyyy", { locale: it })
              : "—"}
          </p>
        </Card>
      </div>

      {/* Appointment history */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Storico appuntamenti
        </h2>
        {appointments.length === 0 ? (
          <Card className="p-8 items-center justify-center text-muted-foreground">
            Nessun appuntamento
          </Card>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => (
              <Card key={apt.id} className="px-4 py-3 flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {apt.service?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {format(new Date(apt.scheduled_at), "d MMM yyyy, HH:mm", { locale: it })}
                    {apt.barber && <span className="ml-1">· {apt.barber.name}</span>}
                  </p>
                  {apt.note && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                      <StickyNote size={11} className="mt-0.5 shrink-0" />
                      {apt.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    €{apt.price % 1 === 0 ? apt.price.toFixed(0) : apt.price.toFixed(2)}
                  </span>
                  <Badge variant={apt.status as any}>
                    {APT_STATUS_LABEL[apt.status]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
