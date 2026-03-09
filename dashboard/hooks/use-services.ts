"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

export function useServices() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("display_order");
    if (data) setServices(data as Service[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  async function createService(payload: Omit<Service, "id" | "created_at" | "display_order">) {
    const maxOrder = services.reduce((m, s) => Math.max(m, s.display_order), 0);
    await supabase.from("services").insert({ ...payload, display_order: maxOrder + 1 });
    await fetchServices();
  }

  async function updateService(id: string, payload: Partial<Omit<Service, "id" | "created_at">>) {
    await supabase.from("services").update(payload).eq("id", id);
    await fetchServices();
  }

  async function deleteService(id: string) {
    await supabase.from("services").delete().eq("id", id);
    await fetchServices();
  }

  async function reorderServices(ordered: Service[]) {
    setServices(ordered);
    await supabase
      .from("services")
      .upsert(ordered.map((s, i) => ({ ...s, display_order: i + 1 })));
  }

  return { services, loading, refetch: fetchServices, createService, updateService, deleteService, reorderServices };
}
