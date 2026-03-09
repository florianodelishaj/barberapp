"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
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
import { KeyboardSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Edit2, Trash2, Clock, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useServices } from "@/hooks/use-services";
import { ServiceForm } from "@/components/services/service-form";
import type { Service } from "@/lib/types";

function SortableRow({
  service,
  onEdit,
  onDelete,
  onToggle,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="px-4 py-3 flex-row items-center gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${service.is_active ? "text-foreground" : "text-muted-foreground/40"}`}>
          {service.name}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {service.duration_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Euro size={11} />
            {service.price.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={service.is_active}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`w-8 h-4 rounded-full transition-colors ${
            service.is_active ? "bg-primary" : "bg-secondary"
          } relative`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
              service.is_active ? "left-[18px]" : "left-0.5"
            }`}
          />
        </div>
      </label>

      <button
        onClick={onEdit}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Edit2 size={15} />
      </button>
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </Card>
  );
}

export default function ServiziPage() {
  const { services, loading, createService, updateService, deleteService, reorderServices } =
    useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(services, oldIndex, newIndex);
    reorderServices(reordered);
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
          <h1 className="text-2xl font-bold text-foreground">Servizi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trascina per riordinare
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Aggiungi
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={services.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {services.map((service) => (
              <SortableRow
                key={service.id}
                service={service}
                onEdit={() => setEditingService(service)}
                onDelete={() => deleteService(service.id)}
                onToggle={() =>
                  updateService(service.id, { is_active: !service.is_active })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {services.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Nessun servizio configurato
        </div>
      )}

      {(showForm || editingService) && (
        <ServiceForm
          service={editingService ?? undefined}
          onSave={async (data) => {
            if (editingService) {
              await updateService(editingService.id, data);
            } else {
              await createService(data);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}
