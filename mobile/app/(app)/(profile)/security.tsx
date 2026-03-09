import { View, Text, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { Card } from "@/components/ui/Card";

export default function SecurityScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = "Inserisci la password attuale";
    if (!form.newPassword) e.newPassword = "Password obbligatoria";
    else if (form.newPassword.length < 8) e.newPassword = "Minimo 8 caratteri";
    else if (!/[A-Z]/.test(form.newPassword)) e.newPassword = "Serve almeno una maiuscola";
    else if (!/[0-9]/.test(form.newPassword)) e.newPassword = "Serve almeno un numero";
    else if (!/[^A-Za-z0-9]/.test(form.newPassword)) e.newPassword = "Serve almeno un carattere speciale";
    if (!form.confirmPassword) e.confirmPassword = "Conferma la password";
    else if (form.confirmPassword !== form.newPassword) e.confirmPassword = "Le password non coincidono";
    return e;
  }

  async function handleUpdate() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);

    // Verifica password attuale tramite re-autenticazione
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) {
      setErrors({ currentPassword: "Impossibile verificare l'utente" });
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: form.currentPassword,
    });

    if (signInError) {
      setErrors({ currentPassword: "Password attuale non corretta" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: form.newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert("Successo", "Password aggiornata", [
        {
          text: "OK",
          onPress: () => {
            setForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            router.back();
          },
        },
      ]);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {/* Header */}
        <View className="px-6 pt-6 pb-6 gap-4 flex-row items-center">
          <BackButton />
          <Text className="font-sora-bold text-lg text-text-primary flex-1">
            Sicurezza
          </Text>
        </View>

        {/* Description */}
        <View className="px-6 pb-6">
          <Text className="font-sora text-sm text-text-secondary leading-5">
            Modifica la tua password per mantenere il tuo account sicuro
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-4 pb-8">
          <Input
            label="Password attuale"
            icon="lock-closed-outline"
            value={form.currentPassword}
            onChangeText={set("currentPassword")}
            isPassword
            placeholder="Inserisci password attuale"
            error={errors.currentPassword}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Input
            label="Nuova password"
            icon="lock-closed-outline"
            value={form.newPassword}
            onChangeText={set("newPassword")}
            isPassword
            placeholder="Inserisci nuova password"
            error={errors.newPassword}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Input
            label="Conferma password"
            icon="lock-closed-outline"
            value={form.confirmPassword}
            onChangeText={set("confirmPassword")}
            isPassword
            placeholder="Conferma nuova password"
            error={errors.confirmPassword}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {/* Requirements */}
          <Card className="gap-2 mt-2">
            <Text className="font-sora-semibold text-xs text-accent">
              Requisiti password:
            </Text>
            <View className="gap-1">
              {[
                "• Minimo 8 caratteri",
                "• Almeno una lettera maiuscola",
                "• Almeno un numero",
                "• Almeno un carattere speciale",
              ].map((req, i) => (
                <Text key={i} className="font-sora text-xs text-text-secondary">
                  {req}
                </Text>
              ))}
            </View>
          </Card>
        </View>

        {/* Buttons */}
        <View className="px-6 gap-3">
          <Button
            label="AGGIORNA PASSWORD"
            onPress={handleUpdate}
            loading={loading}
          />
          <Button
            label="Annulla"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
