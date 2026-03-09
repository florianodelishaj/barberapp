"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBarberDetail } from "@/hooks/use-barbers";
import { BarberForm } from "@/components/barbers/barber-form";
import { ScheduleEditor } from "@/components/barbers/schedule-editor";
import { ExceptionsEditor } from "@/components/barbers/exceptions-editor";
import { createClient } from "@/lib/supabase/client";

export default function BarberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { barber, schedules, exceptions, loading, refetch, saveSchedules, addException, deleteException } =
    useBarberDetail(id);
  const [editOpen, setEditOpen] = useState(false);
  const supabase = createClient();

  if (loading || !barber) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Caricamento…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Barbieri
      </button>

      {/* Profile */}
      <Card className="p-5 flex-row items-center gap-4">
        {barber.avatar_url ? (
          <img
            src={barber.avatar_url}
            alt={barber.name}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl text-muted-foreground font-semibold shrink-0">
            {barber.name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{barber.name}</h1>
          {barber.bio && (
            <p className="text-sm text-muted-foreground mt-1">{barber.bio}</p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Edit2 size={15} />
          Modifica
        </Button>
      </Card>

      <ScheduleEditor
        barberId={id}
        schedules={schedules}
        onSave={saveSchedules}
      />

      <ExceptionsEditor
        barberId={id}
        exceptions={exceptions}
        onAdd={addException}
        onDelete={deleteException}
      />

      {editOpen && (
        <BarberForm
          barber={barber}
          onSave={async (data) => {
            await supabase.from("barbers").update(data).eq("id", id);
            await refetch();
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
