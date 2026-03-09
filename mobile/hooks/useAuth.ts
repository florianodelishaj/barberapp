import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Profile } from "@/types";

export function useAuthListener() {
  const { session, setSession, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // Ascolta i cambiamenti di auth incluso l'inizializzazione da AsyncStorage
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // TOKEN_REFRESHED e USER_UPDATED non richiedono un re-fetch del profilo
      // (evita loop di caricamento durante re-auth o cambio password)
      if (_event === "TOKEN_REFRESHED" || _event === "USER_UPDATED") return;

      if (session) {
        // Se l'utente era già autenticato (es. signInWithPassword per re-auth),
        // non resettare lo stato di loading — il profilo è già in store
        const alreadyAuthenticated = !!useAuthStore.getState().profile;
        if (_event === "SIGNED_IN" && alreadyAuthenticated) return;

        setLoading(true);
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("profile-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          setProfile(payload.new as any);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // non lancia errore se il record non esiste

    if (error) {
      console.error("[fetchProfile] errore:", error.message, error.code);
      setProfile(null);
      setLoading(false);
      return;
    }

    // Profilo non trovato → crealo (utenti ante-trigger)
    if (!data) {
      const user = (await supabase.auth.getUser()).data.user;
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          first_name: user!.user_metadata?.first_name ?? "",
          last_name: user!.user_metadata?.last_name ?? "",
          email: user!.email,
          status: "pending",
        })
        .select()
        .single();
      setProfile(created as Profile | null);
    } else {
      setProfile(data as Profile);
    }

    setLoading(false);
  }
}
