import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { COLORS } from "@/lib/tokens";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const PHONE_RE = /^\+?[\d\s\-\(\)\.]{7,20}$/;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Nome obbligatorio";
    if (!form.lastName.trim()) e.lastName = "Cognome obbligatorio";
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = "Numero non valido";
    return e;
  }

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone ?? "",
    });
    if (profile.birth_date) setBirthDate(new Date(profile.birth_date));
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "");
    });
  }, [profile]);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setBirthDate(selectedDate);
  };

  async function handleSave() {
    if (!profile) return;
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);

    const birthDateISO = birthDate
      ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`
      : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone || null,
        birth_date: birthDateISO,
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      Alert.alert("Errore", error.message);
    } else {
      setProfile({
        ...profile,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone || null,
        birth_date: birthDateISO,
      });
      Alert.alert("Successo", "Profilo aggiornato", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="font-sora text-text-secondary">Caricamento...</Text>
      </SafeAreaView>
    );
  }

  const initials =
    `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();

  const birthDateLabel = birthDate
    ? birthDate.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Non impostata";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-8 flex-row items-center gap-4">
          <BackButton />
          <Text className="font-sora-bold text-[28px] tracking-[-0.56px] text-text-primary flex-1">
            Modifica profilo
          </Text>
        </View>

        {/* Avatar */}
        <View className="items-center pb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-card border-2 border-accent bg-accent/[0.08] items-center justify-center">
              <Text className="font-sora-bold text-3xl text-accent">
                {initials}
              </Text>
            </View>
            {/* <TouchableOpacity
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 w-12 h-12 rounded-card bg-accent items-center justify-center border-2 border-background"
            >
              <Ionicons name="camera-outline" size={20} color={COLORS.white} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Fields */}
        <View className="px-6 gap-4">
          <Input
            label="Nome"
            icon="person-outline"
            value={form.firstName}
            onChangeText={set("firstName")}
            onFocus={() => setShowDatePicker(false)}
            error={errors.firstName}
          />
          <Input
            label="Cognome"
            icon="person-outline"
            value={form.lastName}
            onChangeText={set("lastName")}
            onFocus={() => setShowDatePicker(false)}
            error={errors.lastName}
          />
          <Input
            label="Email"
            icon="mail-outline"
            value={email}
            editable={false}
            keyboardType="email-address"
          />
          <Input
            label="Telefono"
            icon="call-outline"
            value={form.phone}
            onChangeText={set("phone")}
            keyboardType="phone-pad"
            onFocus={() => setShowDatePicker(false)}
            error={errors.phone}
          />

          {/* Data di nascita */}
          <View className="gap-2">
            <Text className="font-sora-semibold text-xs uppercase tracking-[0.6px] text-text-secondary px-2">
              Data di nascita
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(!showDatePicker)}
              className="h-[54px] flex-row items-center bg-surface rounded-input px-4 gap-3 border border-[rgba(198,198,198,0.1)]"
            >
              <View className="w-8 h-8 rounded-full bg-accent/[0.08] items-center justify-center shrink-0">
                <Ionicons name="calendar-outline" size={16} color={COLORS.accent} />
              </View>
              <Text className="flex-1 font-sora text-base text-text-primary">
                {birthDateLabel}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  birthDate ??
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
          </View>
        </View>

        {/* Save */}
        <View className="px-6 pt-8 gap-4">
          <Button
            label="SALVA MODIFICHE"
            onPress={handleSave}
            loading={loading}
          />
          <Text className="font-sora text-xs text-text-secondary text-center leading-[18px]">
            Le tue informazioni personali sono protette e non verranno condivise
            con terze parti.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
