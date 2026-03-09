"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserStatus } from "@/lib/types";

export function useClients() {
  const supabase = createClient();
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setClients(data as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function updateStatus(userId: string, status: UserStatus) {
    await supabase
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", userId);
    await fetchClients();
  }

  return { clients, loading, refetch: fetchClients, updateStatus };
}
