"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBarbers } from "@/hooks/use-barbers";
import { BarberForm } from "@/components/barbers/barber-form";
import type { Barber } from "@/lib/types";

function SortableBarberCard({
  barber,
  onToggle,
}: {
  barber: Barber;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: barber.id });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="p-4 flex-row items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical size={18} />
      </button>

      {barber.avatar_url ? (
        <img
          src={barber.avatar_url}
          alt={barber.name}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold shrink-0">
          {barber.name[0]}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${barber.is_active ? "text-foreground" : "text-muted-foreground/40"}`}>
          {barber.name}
        </p>
        {barber.bio && (
          <p className="text-xs text-muted-foreground truncate">{barber.bio}</p>
        )}
      </div>

      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={barber.is_active}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`w-8 h-4 rounded-full transition-colors ${
            barber.is_active ? "bg-primary" : "bg-secondary"
          } relative`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
              barber.is_active ? "left-[18px]" : "left-0.5"
            }`}
          />
        </div>
        <span className="text-xs text-muted-foreground w-12">
          {barber.is_active ? "Attivo" : "Inattivo"}
        </span>
      </label>

      <Link
        href={`/barbieri/${barber.id}`}
        className="text-xs text-primary hover:underline shrink-0"
      >
        Gestisci →
      </Link>
    </Card>
  );
}

export default function BarberiPage() {
  const { barbers, loading, createBarber, updateBarber, reorderBarbers } = useBarbers();
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = barbers.findIndex((b) => b.id === active.id);
    const newIndex = barbers.findIndex((b) => b.id === over.id);
    reorderBarbers(arrayMove(barbers, oldIndex, newIndex));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Caricamento…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Barbieri</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Trascina per riordinare</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Aggiungi
        </Button>
      </div>

      {barbers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Scissors size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nessun barbiere</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={barbers.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {barbers.map((barber) => (
                <SortableBarberCard
                  key={barber.id}
                  barber={barber}
                  onToggle={() =>
                    updateBarber(barber.id, { is_active: !barber.is_active })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showForm && (
        <BarberForm
          onSave={createBarber}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
