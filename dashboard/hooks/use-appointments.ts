"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/lib/types";
import type { EventInput } from "@fullcalendar/core";

function toCalendarEvent(apt: Appointment): EventInput {
  const start = new Date(apt.scheduled_at);
  const end = new Date(start.getTime() + apt.duration_minutes * 60000);
  const isManualBlock = apt.user_id === null;
  const barberColor = (apt.barber as any)?.color ?? "#FA3D3B";

  return {
    id: apt.id,
    title: isManualBlock
      ? apt.note || "Slot bloccato"
      : `${apt.client?.first_name ?? ""} ${apt.client?.last_name ?? ""}`.trim(),
    start,
    end,
    backgroundColor: isManualBlock ? "#2a2a2a" : barberColor,
    borderColor: isManualBlock ? "#444444" : barberColor,
    classNames: isManualBlock ? ["manual-block"] : [],
    extendedProps: {
      appointment: apt,
      isManualBlock,
    },
  };
}

export function useAppointments(dateRange: { start: Date; end: Date } | null) {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!dateRange) return;
    setLoading(true);

    const { data } = await supabase
      .from("appointments")
      .select(
        `
        *,
        barber:barbers(id, name, avatar_url, color),
        service:services(id, name, duration_minutes, price),
        client:profiles!user_id(id, first_name, last_name, phone, email)
      `
      )
      .gte("scheduled_at", dateRange.start.toISOString())
      .lte("scheduled_at", dateRange.end.toISOString())
      .neq("status", "cancelled")
      .order("scheduled_at");

    if (data) {
      const apts = data as Appointment[];
      setAppointments(apts);
      setEvents(apts.map(toCalendarEvent));
    }
    setLoading(false);
  }, [dateRange?.start.toISOString(), dateRange?.end.toISOString()]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Realtime subscription
  useEffect(() => {
    channelRef.current = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchAppointments]);

  async function updateAppointmentStatus(
    id: string,
    status: "confirmed" | "cancelled" | "completed"
  ) {
    const update: Record<string, unknown> = { status };
    if (status === "cancelled") update.cancelled_at = new Date().toISOString();

    await supabase.from("appointments").update(update).eq("id", id);
    await fetchAppointments();

    if (status === "cancelled") {
      supabase.functions.invoke("send-push", {
        body: { appointment_id: id, type: "cancelled" },
      });
    }
  }

  async function createManualBlock(block: {
    barber_id: string;
    scheduled_at: string;
    duration_minutes: number;
    note: string;
    service_id?: string;
    user_id?: string;
    price: number;
  }) {
    const { data } = await supabase
      .from("appointments")
      .insert({ ...block, user_id: block.user_id ?? null, status: "confirmed" })
      .select("id")
      .single();

    await fetchAppointments();

    if (data?.id && block.user_id) {
      supabase.functions.invoke("send-push", {
        body: { appointment_id: data.id, type: "booked" },
      });
    }
  }

  return {
    events,
    appointments,
    loading,
    refetch: fetchAppointments,
    updateAppointmentStatus,
    createManualBlock,
  };
}
