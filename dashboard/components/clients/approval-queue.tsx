"use client";

import { Check, X, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@/lib/types";

interface ApprovalQueueProps {
  pending: Profile[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalQueue({ pending, onApprove, onReject }: ApprovalQueueProps) {
  if (pending.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        In attesa di approvazione ({pending.length})
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pending.map((profile) => (
          <Card key={profile.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {profile.first_name} {profile.last_name}
                </p>
                {profile.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail size={11} />
                    {profile.email}
                  </p>
                )}
                {profile.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone size={11} />
                    {profile.phone}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar size={11} />
                {format(new Date(profile.created_at), "d MMM", { locale: it })}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-success/20 text-success hover:bg-success/30 border border-success/30"
                onClick={() => onApprove(profile.id)}
              >
                <Check size={14} />
                Approva
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                onClick={() => onReject(profile.id)}
              >
                <X size={14} />
                Rifiuta
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
