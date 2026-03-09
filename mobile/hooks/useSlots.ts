import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Barber, TimeSlot } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface SlotInfo {
  time: string;
  available: boolean;
}

interface BarberSlots {
  barber: Barber;
  slots: SlotInfo[];
  isOff?: boolean;
}

const SLOT_STEP = 15;

function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  stepMinutes: number = SLOT_STEP,
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const m = (current % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += stepMinutes;
  }
  return slots;
}

export function useSlots(date: string | null, durationMinutes: number) {
  const [barberSlots, setBarberSlots] = useState<BarberSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Derived state pattern to avoid the flicker of empty message
  if (date !== prevDate) {
    setPrevDate(date);
    if (date) {
      setLoading(true);
      setBarberSlots([]);
    } else {
      setLoading(false);
      setBarberSlots([]);
    }
  }

  useEffect(() => {
    if (date && durationMinutes) {
      fetchSlots();
    }
  }, [date, durationMinutes]);

  useEffect(() => {
    if (!date) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel(`slots-${date}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => { fetchSlots(); },
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [date]);

  async function fetchSlots() {
    setLoading(true);
    const dayOfWeek = new Date(date!).getDay();

    // Barbers con schedule per quel giorno
    const { data: schedulesRaw } = await supabase
      .from("barber_schedules")
      .select("*, barber:barbers(*)")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    const schedules = schedulesRaw
      ?.filter((s: any) => s.barber?.is_active === true)
      .sort((a: any, b: any) => (a.barber?.display_order ?? 0) - (b.barber?.display_order ?? 0));

    if (!schedules?.length) {
      setBarberSlots([]);
      setLoading(false);
      return;
    }

    // Eccezioni per la data
    const barberIds = schedules.map((s: any) => s.barber_id);
    const { data: exceptions } = await supabase
      .from("barber_exceptions")
      .select("*")
      .eq("date", date)
      .in("barber_id", barberIds);

    // Appuntamenti esistenti per quella data
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;
    const { data: existing } = await supabase
      .from("appointments")
      .select("barber_id, scheduled_at, duration_minutes")
      .eq("status", "confirmed")
      .gte("scheduled_at", dayStart)
      .lte("scheduled_at", dayEnd);

    const result: BarberSlots[] = [];

    for (const schedule of schedules as any[]) {
      const exception = exceptions?.find(
        (e: any) => e.barber_id === schedule.barber_id,
      );
      if (exception?.is_off) {
        result.push({ barber: schedule.barber, slots: [], isOff: true });
        continue;
      }

      const start = exception?.custom_start || schedule.start_time;
      const end = exception?.custom_end || schedule.end_time;
      const allSlots = generateTimeSlots(start, end, durationMinutes);

      // Rimuovi slot occupati
      const bookedSlots = (existing || [])
        .filter((a: any) => a.barber_id === schedule.barber_id)
        .map((a: any) => {
          const d = new Date(a.scheduled_at);
          return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        });

      // Pre-compute current time in minutes if the selected date is today
      const now = new Date();
      const isToday =
        now.getFullYear() === new Date(date!).getFullYear() &&
        now.getMonth() === new Date(date!).getMonth() &&
        now.getDate() === new Date(date!).getDate();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const futureSlots = allSlots.filter((slot) => {
        const [h, m] = slot.split(":").map(Number);
        const slotStart = h * 60 + m;

        // Skip past slots if the selected date is today
        if (isToday && slotStart <= currentMinutes) {
          return false;
        }
        return true;
      });

      const slotsWithAvailability = futureSlots.map((slot) => {
        const [h, m] = slot.split(":").map(Number);
        const slotStart = h * 60 + m;

        const isBooked = (existing || []).some((a: any) => {
          if (a.barber_id !== schedule.barber_id) return false;
          const d = new Date(a.scheduled_at);
          const aStart = d.getHours() * 60 + d.getMinutes();
          const aEnd = aStart + a.duration_minutes;
          return slotStart < aEnd && slotStart + durationMinutes > aStart;
        });

        return { time: slot, available: !isBooked };
      });

      if (slotsWithAvailability.length > 0) {
        result.push({ barber: schedule.barber, slots: slotsWithAvailability });
      }
    }

    setBarberSlots(result);
    setLoading(false);
  }

  return { barberSlots, loading };
}
