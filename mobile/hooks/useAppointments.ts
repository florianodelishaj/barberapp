import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment, AppointmentStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';

export function useAppointments() {
  const { session } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchAppointments();

    // Realtime: aggiorna automaticamente quando un appuntamento cambia
    channelRef.current = supabase
      .channel(`appointments-user-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => { fetchAppointments(); }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [session]);

  async function fetchAppointments() {
    const { data } = await supabase
      .from('appointments')
      .select('*, barber:barbers(*), service:services(*)')
      .eq('user_id', session!.user.id)
      .order('scheduled_at', { ascending: false });
    setAppointments((data as Appointment[]) ?? []);
    setLoading(false);
  }

  async function cancelAppointment(id: string) {
    await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: session!.user.id,
      })
      .eq('id', id);
    await fetchAppointments();
  }

  const upcoming = appointments.filter(
    (a) => a.status === 'confirmed' && new Date(a.scheduled_at) >= new Date()
  );
  const past = appointments.filter(
    (a) => a.status === 'completed' || (a.status === 'confirmed' && new Date(a.scheduled_at) < new Date())
  );
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  return { appointments, upcoming, past, cancelled, loading, cancelAppointment, refetch: fetchAppointments };
}
