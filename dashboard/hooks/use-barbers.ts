"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Barber, BarberSchedule, BarberException } from "@/lib/types";

export function useBarbers() {
  const supabase = createClient();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("barbers")
      .select("*")
      .order("display_order");
    if (data) setBarbers(data as Barber[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  async function createBarber(payload: {
    name: string;
    bio: string;
    avatar_url: string | null;
    color: string;
  }) {
    const maxOrder = barbers.reduce((m, b) => Math.max(m, b.display_order ?? 0), 0);
    await supabase.from("barbers").insert({ ...payload, is_active: true, display_order: maxOrder + 1 });
    await fetchBarbers();
  }

  async function reorderBarbers(ordered: Barber[]) {
    setBarbers(ordered);
    await supabase
      .from("barbers")
      .upsert(ordered.map((b, i) => ({ ...b, display_order: i + 1 })));
  }

  async function updateBarber(
    id: string,
    payload: Partial<Pick<Barber, "name" | "bio" | "avatar_url" | "is_active" | "color">>
  ) {
    await supabase.from("barbers").update(payload).eq("id", id);
    await fetchBarbers();
  }

  async function deleteBarber(id: string) {
    await supabase.from("barbers").delete().eq("id", id);
    await fetchBarbers();
  }

  return { barbers, loading, refetch: fetchBarbers, createBarber, updateBarber, deleteBarber, reorderBarbers };
}

export function useBarberDetail(barberId: string) {
  const supabase = createClient();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [schedules, setSchedules] = useState<BarberSchedule[]>([]);
  const [exceptions, setExceptions] = useState<BarberException[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: b }, { data: s }, { data: e }] = await Promise.all([
      supabase.from("barbers").select("*").eq("id", barberId).single(),
      supabase
        .from("barber_schedules")
        .select("*")
        .eq("barber_id", barberId)
        .order("day_of_week"),
      supabase
        .from("barber_exceptions")
        .select("*")
        .eq("barber_id", barberId)
        .order("date"),
    ]);
    if (b) setBarber(b as Barber);
    if (s) setSchedules(s as BarberSchedule[]);
    if (e) setExceptions(e as BarberException[]);
    setLoading(false);
  }, [barberId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function saveSchedules(rows: Omit<BarberSchedule, "id">[]) {
    // Upsert all rows for this barber
    await supabase
      .from("barber_schedules")
      .delete()
      .eq("barber_id", barberId);
    if (rows.length > 0) {
      await supabase.from("barber_schedules").insert(rows);
    }
    await fetchAll();
  }

  async function addException(payload: Omit<BarberException, "id">) {
    await supabase.from("barber_exceptions").insert(payload);
    await fetchAll();
  }

  async function deleteException(id: string) {
    await supabase.from("barber_exceptions").delete().eq("id", id);
    await fetchAll();
  }

  return {
    barber,
    schedules,
    exceptions,
    loading,
    refetch: fetchAll,
    saveSchedules,
    addException,
    deleteException,
  };
}
