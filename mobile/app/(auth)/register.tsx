import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BackButton } from "@/components/ui/BackButton";
import { COLORS } from "@/lib/tokens";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });

  // Data di nascita gestita separatamente usando Date obj
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^\+?[\d\s\-\(\)\.]{7,20}$/;

  function set(key: keyof typeof form) {
    return (val: string) => {
      setForm((f) => ({ ...f, [key]: val }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
    };
  }

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthDate(selectedDate);
      if (errors.birthDate) setErrors((e) => ({ ...e, birthDate: "" }));
    }
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Nome obbligatorio";
    if (!form.lastName.trim()) e.lastName = "Cognome obbligatorio";
    if (!birthDate) e.birthDate = "Data di nascita obbligatoria";
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = "Numero non valido";
    if (!form.email.trim()) e.email = "Email obbligatoria";
    else if (!EMAIL_RE.test(form.email)) e.email = "Email non valida";
    if (!form.password) e.password = "Password obbligatoria";
    else if (form.password.length < 8) e.password = "Minimo 8 caratteri";
    else if (!/[A-Z]/.test(form.password)) e.password = "Serve almeno una maiuscola";
    else if (!/[0-9]/.test(form.password)) e.password = "Serve almeno un numero";
    else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = "Serve almeno un carattere speciale";
    if (!form.confirm) e.confirm = "Conferma la password";
    else if (form.confirm !== form.password) e.confirm = "Le password non coincidono";
    return e;
  }

  async function handleRegister() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    // Convertiamo Date in YYYY-MM-DD per il database
    const year = birthDate!.getFullYear();
    const month = String(birthDate!.getMonth() + 1).padStart(2, "0");
    const day = String(birthDate!.getDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    setLoading(true);
    setErrors({});

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          name: `${form.firstName} ${form.lastName}`,
          phone: form.phone || null,
          birth_date: isoDate,
        },
        // Nessuna redirect URL → nessuna email di conferma gestita lato app
        emailRedirectTo: undefined,
      },
    });

    if (signUpError) {
      setErrors({ _general: signUpError.message });
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrors({ _general: "Errore durante la registrazione" });
      setLoading(false);
      return;
    }

    // Il trigger Supabase crea il profilo con status='pending' automaticamente.
    // Se il trigger non è attivo (utenti pre-schema), creiamo il profilo manualmente.
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone || null,
      birth_date: isoDate,
      status: "pending",
    });

    if (profileError) {
      console.warn(
        "[register] profilo già esistente o errore:",
        profileError.message,
      );
    }

    setLoading(false);
    // AuthGuard gestirà automaticamente il redirect basato su profile.status
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="flex-1 px-6 pt-6 gap-8">
          <View className="gap-4">
            <BackButton />
            <View className="gap-1">
              <Text className="font-sora-bold text-xl text-text-primary">
                Crea account
              </Text>
              <Text className="font-sora-light text-sm text-text-secondary">
                Inserisci i tuoi dati
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <Input
              icon="person-outline"
              placeholder="Nome"
              value={form.firstName}
              onChangeText={set("firstName")}
              onFocus={() => setShowDatePicker(false)}
              error={errors.firstName}
            />
            <Input
              icon="person-outline"
              placeholder="Cognome"
              value={form.lastName}
              onChangeText={set("lastName")}
              onFocus={() => setShowDatePicker(false)}
              error={errors.lastName}
            />

            {/* Fake input per il DatePicker stilizzato come Input.tsx */}
            <View className="gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(!showDatePicker)}
              className={[
                "h-[54px] flex-row items-center bg-surface rounded-input px-4 gap-3 border",
                errors.birthDate ? "border-accent" : "border-[rgba(198,198,198,0.1)]",
              ].join(" ")}
            >
              <View className="w-8 h-8 rounded-full bg-accent/[0.08] items-center justify-center shrink-0">
                <Ionicons name="calendar-outline" size={16} color={COLORS.accent} />
              </View>
              <Text
                className={`font-sora flex-1 text-base ${birthDate ? "text-text-primary" : "text-text-primary/50"}`}
              >
                {birthDate
                  ? birthDate.toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Data di nascita"}
              </Text>
            </TouchableOpacity>
            {errors.birthDate ? (
              <Text className="font-sora text-sm text-accent">{errors.birthDate}</Text>
            ) : null}
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={
                  birthDate ||
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18),
                  )
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                minimumDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 100),
                  )
                }
                onChange={onChangeDate}
                textColor={COLORS.textPrimary}
              />
            )}

            <Input
              icon="call-outline"
              placeholder="Numero di telefono"
              value={form.phone}
              onChangeText={set("phone")}
              keyboardType="phone-pad"
              onFocus={() => setShowDatePicker(false)}
              error={errors.phone}
            />
            <Input
              icon="mail-outline"
              placeholder="Email"
              value={form.email}
              onChangeText={set("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setShowDatePicker(false)}
              error={errors.email}
            />
            <Input
              icon="lock-closed-outline"
              placeholder="Password"
              value={form.password}
              onChangeText={set("password")}
              isPassword
              onFocus={() => setShowDatePicker(false)}
              error={errors.password}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Input
              icon="lock-closed-outline"
              placeholder="Conferma Password"
              value={form.confirm}
              onChangeText={set("confirm")}
              isPassword
              onFocus={() => setShowDatePicker(false)}
              error={errors.confirm}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {errors._general ? (
            <Text className="font-sora text-sm text-accent text-center">
              {errors._general}
            </Text>
          ) : null}

          <Button
            label="Registrati"
            onPress={handleRegister}
            loading={loading}
          />

          <View className="flex-row justify-center gap-1">
            <Text className="font-sora text-sm text-text-secondary">
              Hai già un account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="font-sora-semibold text-sm text-accent">
                Accedi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
