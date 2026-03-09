"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export default function ImpostazioniPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const supabase = createClient();

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("Le password non coincidono");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("La password deve essere di almeno 8 caratteri");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password aggiornata");
      setNewPwd("");
      setConfirmPwd("");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Impostazioni</h1>

      {/* Profile info */}
      <Card className="p-5">
        <p className="text-sm text-muted-foreground mb-1">Account</p>
        <p className="font-semibold text-foreground">
          {profile.first_name} {profile.last_name}
        </p>
        {profile.email && (
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        )}
      </Card>

      {/* Change password */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <KeyRound size={16} />
          Cambia password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nuova password</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Min. 8 caratteri"
              icon={<Lock size={15} />}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Conferma password</Label>
            <Input
              type="password"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Ripeti la password"
              icon={<Lock size={15} />}
            />
          </div>
          <Button type="submit" disabled={saving || !newPwd || !confirmPwd}>
            {saving ? "Salvataggio…" : "Aggiorna password"}
          </Button>
        </form>
      </Card>

      {/* Logout */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <LogOut size={16} />
          Disconnetti
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Verrai reindirizzato alla pagina di login.
        </p>
        <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Disconnessione…" : "Logout"}
        </Button>
      </Card>
    </div>
  );
}
