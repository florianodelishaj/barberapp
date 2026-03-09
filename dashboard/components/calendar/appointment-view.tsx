"use client";

import { useState } from "react";
import type { Appointment } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { User, Scissors, Clock, Phone, StickyNote, CheckCheck, X } from "lucide-react";

interface AppointmentViewProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: "completed" | "cancelled") => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "confirmed" | "completed" | "cancelled" }> = {
  confirmed: { label: "Confermato", variant: "confirmed" },
  completed: { label: "Completato", variant: "completed" },
  cancelled: { label: "Cancellato", variant: "cancelled" },
};

export function AppointmentView({
  appointment,
  open,
  onOpenChange,
  onStatusChange,
}: AppointmentViewProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!appointment) return null;

  const isManualBlock = appointment.user_id === null;
  const start = new Date(appointment.scheduled_at);
  const end = new Date(start.getTime() + appointment.duration_minutes * 60000);
  const statusInfo = STATUS_LABELS[appointment.status];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setConfirmCancel(false); onOpenChange(v); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {isManualBlock ? "Slot bloccato" : "Dettaglio appuntamento"}
            <Badge variant={statusInfo.variant} className="ml-auto text-xs">
              {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Date & time */}
          <div className="flex items-start gap-3 text-muted-foreground">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-foreground font-medium capitalize">
                {format(start, "EEEE d MMMM yyyy", { locale: it })}
              </p>
              <p>
                {format(start, "HH:mm")} – {format(end, "HH:mm")} ({appointment.duration_minutes} min)
              </p>
            </div>
          </div>

          <Separator />

          {/* Client or block note */}
          {isManualBlock ? (
            <div className="flex items-start gap-3 text-muted-foreground">
              <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Nota</p>
                <p className="text-foreground">{appointment.note || "—"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-muted-foreground">
              <User className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
                <p className="text-foreground font-medium">
                  {appointment.client?.first_name} {appointment.client?.last_name}
                </p>
                {appointment.client?.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{appointment.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Client note (regular appointments) */}
          {!isManualBlock && appointment.note && (
            <div className="flex items-start gap-3 text-muted-foreground">
              <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Nota cliente</p>
                <p className="text-foreground">{appointment.note}</p>
              </div>
            </div>
          )}

          {/* Barber */}
          {appointment.barber && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Scissors className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Barbiere</p>
                <p className="text-foreground">{appointment.barber.name}</p>
              </div>
            </div>
          )}

          {/* Service */}
          {appointment.service && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Scissors className="w-4 h-4 shrink-0 opacity-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Servizio</p>
                <p className="text-foreground">
                  {appointment.service.name}
                  {" · "}
                  {appointment.service.duration_minutes} min
                  {" · "}
                  €{Number(isManualBlock ? appointment.service.price : appointment.price).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {appointment.status === "confirmed" && (
          <>
            <Separator />
            {confirmCancel ? (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Sei sicuro di voler cancellare questo appuntamento?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => setConfirmCancel(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-1.5"
                    size="sm"
                    onClick={() => {
                      onStatusChange(appointment.id, "cancelled");
                      onOpenChange(false);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Sì, cancella
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  size="sm"
                  onClick={() => {
                    onStatusChange(appointment.id, "completed");
                    onOpenChange(false);
                  }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Completato
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-1.5"
                  size="sm"
                  onClick={() => setConfirmCancel(true)}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancella
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
