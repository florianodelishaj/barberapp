import { View, Text, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DismissKeyboard } from "@/components/ui/DismissKeyboard";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/lib/tokens";

export default function ConfirmScreen() {
  const router = useRouter();
  const { service, date, slot, barber, reset } = useBookingStore();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  if (!service || !date || !slot || !barber) {
    return null;
  }

  const dateObj = new Date(`${date}T${slot}:00`);
  const dateStr = dateObj.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeStr = slot;

  async function handleConfirm() {
    if (!session) return;
    setLoading(true);

    const { error } = await supabase.from("appointments").insert({
      user_id: session.user.id,
      barber_id: barber!.id,
      service_id: service!.id,
      scheduled_at: dateObj.toISOString(),
      duration_minutes: service!.duration_minutes,
      price: service!.price,
      status: "confirmed",
      note: note.trim() || null,
    });

    setLoading(false);

    if (error) {
      const isConflict =
        error.code === "23P01" ||
        (error.message ?? "").toLowerCase().includes("appointments_no_overlap");
      Alert.alert(
        "Slot non disponibile",
        isConflict
          ? "Questo slot è appena stato prenotato da qualcun altro. Scegli un altro orario."
          : error.message
      );
    } else {
      Alert.alert("Successo", "Prenotazione confermata!", [
        {
          text: "OK",
          onPress: () => {
            reset(); // reset booking store
            router.dismissAll(); // ← pulisce lo stack di (home)
            router.replace("/(app)/(orders)");
          },
        },
      ]);
    }
  }

  return (
    <DismissKeyboard>
    <SafeAreaView className="flex-1 bg-background px-6 py-6">
      <View className="mb-4 gap-4 flex-row items-center">
        <BackButton />
        <Text className="font-sora-bold text-lg text-text-primary flex-1">
          Conferma prenotazione
        </Text>
      </View>

      <View className="flex-1 gap-4">
        {/* Service Card */}
        <Card className="gap-3">
          <Text className="font-sora-semibold text-xs text-text-secondary">
            Servizio
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="font-sora-bold text-base text-text-primary">
              {service.name}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="time-outline"
                size={12}
                color={COLORS.textSecondary}
              />
              <Text className="font-sora text-xs text-text-secondary">
                {service.duration_minutes} min
              </Text>
            </View>
          </View>
          <Text
            className="font-sora-extrabold text-accent"
            style={{ fontSize: 36, lineHeight: 40 }}
          >
            €{service.price.toFixed(2)}
          </Text>
        </Card>

        {/* Barber Card */}
        <Card className="gap-2">
          <Text className="font-sora-semibold text-xs text-text-secondary">
            Barbiere
          </Text>
          <Text className="font-sora-bold text-base text-text-primary">
            {barber.name}
          </Text>
        </Card>

        {/* DateTime Card */}
        <Card className="gap-3">
          <Text className="font-sora-semibold text-xs text-text-secondary">
            Data e ora
          </Text>
          <View className="gap-2.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text className="font-sora text-xs text-text-secondary">
                {dateStr}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text className="font-sora text-xs text-text-secondary">
                {timeStr}
              </Text>
            </View>
          </View>
          <View className="self-start">
            <Badge variant="pending" label="In attesa di conferma" />
          </View>
        </Card>

                {/* Note Card */}
        <Card className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-sora-semibold text-xs text-text-secondary">
              Nota
            </Text>
            <Text className="font-sora text-xs" style={{ color: `${COLORS.textPrimary}40` }}>
              Opzionale
            </Text>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Lascia una nota per il nostro barbiere..."
            placeholderTextColor={`${COLORS.textPrimary}40`}
            multiline
            numberOfLines={3}
            maxLength={300}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            className="font-sora text-sm text-text-primary"
            style={{ minHeight: 60, textAlignVertical: "top" }}
          />
        </Card>
      </View>

      {/* Buttons */}
      <View className="gap-3 pt-6">
        <Button
          label="Conferma prenotazione"
          onPress={handleConfirm}
          loading={loading}
        />
        <Button
          label="Annulla"
          variant="ghost"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
    </DismissKeyboard>
  );
}
