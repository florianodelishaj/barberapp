import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Barber, TimeSlot } from '@/types';

interface BarberSlots {
  barber: Barber;
  slots: string[];
}

function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += 30; // step di 30 minuti
  }
  return slots;
}

export function useSlots(date: string | null, durationMinutes: number) {
  const [barberSlots, setBarberSlots] = useState<BarberSlots[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date || !durationMinutes) return;
    fetchSlots();
  }, [date, durationMinutes]);

  async function fetchSlots() {
    setLoading(true);
    const dayOfWeek = new Date(date!).getDay();

    // Barbers con schedule per quel giorno
    const { data: schedules } = await supabase
      .from('barber_schedules')
      .select('*, barber:barbers(*)')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (!schedules?.length) {
      setBarberSlots([]);
      setLoading(false);
      return;
    }

    // Eccezioni per la data
    const barberIds = schedules.map((s: any) => s.barber_id);
    const { data: exceptions } = await supabase
      .from('barber_exceptions')
      .select('*')
      .eq('date', date)
      .in('barber_id', barberIds);

    // Appuntamenti esistenti per quella data
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;
    const { data: existing } = await supabase
      .from('appointments')
      .select('barber_id, scheduled_at, duration_minutes')
      .eq('status', 'confirmed')
      .gte('scheduled_at', dayStart)
      .lte('scheduled_at', dayEnd);

    const result: BarberSlots[] = [];

    for (const schedule of schedules as any[]) {
      const exception = exceptions?.find((e: any) => e.barber_id === schedule.barber_id);
      if (exception?.is_off) continue;

      const start = exception?.custom_start || schedule.start_time;
      const end = exception?.custom_end || schedule.end_time;
      const allSlots = generateTimeSlots(start, end, durationMinutes);

      // Rimuovi slot occupati
      const bookedSlots = (existing || [])
        .filter((a: any) => a.barber_id === schedule.barber_id)
        .map((a: any) => {
          const d = new Date(a.scheduled_at);
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        });

      const freeSlots = allSlots.filter((slot) => {
        const [h, m] = slot.split(':').map(Number);
        const slotStart = h * 60 + m;
        return !(existing || []).some((a: any) => {
          if (a.barber_id !== schedule.barber_id) return false;
          const d = new Date(a.scheduled_at);
          const aStart = d.getHours() * 60 + d.getMinutes();
          const aEnd = aStart + a.duration_minutes;
          return slotStart < aEnd && slotStart + durationMinutes > aStart;
        });
      });

      if (freeSlots.length > 0) {
        result.push({ barber: schedule.barber, slots: freeSlots });
      }
    }

    setBarberSlots(result);
    setLoading(false);
  }

  return { barberSlots, loading };
}
