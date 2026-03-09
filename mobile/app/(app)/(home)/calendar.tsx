import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useSlots } from "@/hooks/useSlots";
import { useBookingStore } from "@/store/bookingStore";
import { BackButton } from "@/components/ui/BackButton";
import { Card } from "@/components/ui/Card";
import { COLORS } from "@/lib/tokens";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

LocaleConfig.locales["it"] = {
  monthNames: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  monthNamesShort: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  dayNamesShort: ["D", "L", "M", "M", "G", "V", "S"],
  today: "Oggi",
};
LocaleConfig.defaultLocale = "it";

const calendarTheme = {
  calendarBackground: COLORS.surface,
  monthTextColor: COLORS.textPrimary,
  textMonthFontFamily: "Sora_700Bold",
  textMonthFontSize: 14,
  arrowColor: COLORS.accent,
  textDayHeaderFontFamily: "Sora_600SemiBold",
  textDayHeaderFontSize: 10,
  textDayHeaderColor: COLORS.textSecondary,
  dayTextColor: COLORS.textPrimary,
  textDayFontFamily: "Sora_600SemiBold",
  textDayFontSize: 14,
  todayTextColor: COLORS.accent,
  selectedDayBackgroundColor: COLORS.accent,
  selectedDayTextColor: "#ffffff",
  disabledArrowColor: COLORS.textMuted,
  textDisabledColor: COLORS.textMuted,
  "stylesheet.calendar.header": {
    arrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(250,61,59,0.08)",
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: 0,
    },
  },
  "stylesheet.day.basic": {
    base: {
      width: 36,
      height: 36,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    selected: {
      backgroundColor: COLORS.accent,
      borderRadius: 18,
      width: 36,
      height: 36,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    today: {
      borderRadius: 18,
      width: 36,
      height: 36,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
  },
};

export default function CalendarScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const {
    setDate,
    setService: setStoreService,
    setSlotAndBarber,
  } = useBookingStore();
  const { barberSlots, loading } = useSlots(
    selectedDate,
    service?.duration_minutes ?? 30,
  );

  const todayIso = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!serviceId) return;
    supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single()
      .then(({ data }) => {
        setService(data);
        setStoreService(data);
      });
  }, [serviceId]);

  const markedDates = useMemo(() => {
    if (!selectedDate) return {};
    return { [selectedDate]: { selected: true, selectedColor: COLORS.accent } };
  }, [selectedDate]);

  const handleSelectSlot = (slot: string, barber: any) => {
    setSlotAndBarber(slot, barber);
    router.push("/(app)/(home)/confirm");
  };

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center gap-4">
          <BackButton />
          <Text className="font-sora-bold text-xl text-text-primary">
            Scegli Data e Ora
          </Text>
        </View>

        <View className="px-6 gap-4">
          {/* Service summary card */}
          <Card className="gap-3 overflow-hidden">
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

          {/* Calendar card */}
          <Card className="overflow-hidden py-0 px-0">
            <Calendar
              theme={calendarTheme}
              minDate={todayIso}
              markedDates={markedDates}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setDate(day.dateString);
              }}
              firstDay={1}
              disableAllTouchEventsForDisabledDays
            />
          </Card>

          {/* Availability */}
          {selectedDate && (
            <View className="gap-3">
              <Text className="font-sora-bold text-sm text-text-primary">
                Disponibilità per{" "}
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "it-IT",
                  { day: "numeric", month: "long" },
                )}
              </Text>
              {loading ? (
                <ActivityIndicator color={COLORS.accent} />
              ) : barberSlots.length === 0 ? (
                <Card>
                  <Text className="font-sora-semibold text-base text-text-secondary text-center">
                    Nessuno slot disponibile per questa data
                  </Text>
                </Card>
              ) : (
                barberSlots.map((bs) => (
                  <Card key={bs.barber.id} className="gap-3 overflow-hidden">
                    <Text className="font-sora-semibold text-xs text-text-secondary">
                      Barbiere
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-full bg-background items-center justify-center">
                        <Ionicons
                          name="person"
                          size={22}
                          color={COLORS.textSecondary}
                        />
                      </View>
                      <Text className="font-sora-bold text-sm text-text-primary">
                        {bs.barber.name}
                      </Text>
                    </View>
                    {bs.isOff ? (
                      <View
                        className="flex-row items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                        <Text className="font-sora-semibold text-xs text-text-secondary">
                          Non disponibile in questa data
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {bs.slots.map((slotObj) => (
                          <TouchableOpacity
                            key={slotObj.time}
                            onPress={() =>
                              slotObj.available &&
                              handleSelectSlot(slotObj.time, bs.barber)
                            }
                            activeOpacity={slotObj.available ? 0.7 : 1}
                            style={{
                              backgroundColor: slotObj.available
                                ? "rgba(250,61,59,0.08)"
                                : "rgba(255,255,255,0.05)",
                            }}
                            className={`px-4 py-2 rounded-full ${slotObj.available ? "" : "opacity-50"}`}
                            disabled={!slotObj.available}
                          >
                            <Text
                              className={`font-sora-bold ${
                                slotObj.available
                                  ? "text-accent"
                                  : "text-text-secondary line-through"
                              }`}
                            >
                              {slotObj.time}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Card>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
