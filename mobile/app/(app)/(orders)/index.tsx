import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useState, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppointments } from "@/hooks/useAppointments";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COLORS } from "@/lib/tokens";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Calendar from "expo-calendar";
import PagerView from "react-native-pager-view";

type TabType = "upcoming" | "past" | "cancelled";
const TABS: TabType[] = ["upcoming", "past", "cancelled"];
const TAB_LABELS: Record<TabType, string> = {
  upcoming: "Prossimi",
  past: "Passati",
  cancelled: "Cancellati",
};
const EMPTY_STATE: Record<TabType, { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; subtitle: string }> = {
  upcoming: {
    icon: "cut-outline",
    title: "Nessun appuntamento",
    subtitle: "Prenota il tuo prossimo taglio e scopri i nostri barbieri",
  },
  past: {
    icon: "checkmark-done-outline",
    title: "Nessuno storico",
    subtitle: "I tuoi appuntamenti completati appariranno qui",
  },
  cancelled: {
    icon: "close-circle-outline",
    title: "Nessuna cancellazione",
    subtitle: "Gli appuntamenti cancellati appariranno qui",
  },
};

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const pagerRef = useRef<PagerView>(null);
  const { upcoming, past, cancelled, loading, cancelAppointment, refetch } =
    useAppointments();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const data: Record<TabType, typeof upcoming> = { upcoming, past, cancelled };

  const handleTabPress = (tab: TabType) => {
    const index = TABS.indexOf(tab);
    setActiveTab(tab);
    pagerRef.current?.setPage(index);
  };

  const handleCancel = (apt: any) => {
    const date = new Date(apt.scheduled_at);
    const dateStr = date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
    });
    const timeStr = date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    Alert.alert(
      "Cancella prenotazione",
      `Sei sicuro di voler cancellare la prenotazione del ${dateStr} alle ${timeStr} con ${apt.barber?.name}?`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () => cancelAppointment(apt.id),
        },
      ],
    );
  };

  const handleAddToCalendar = async (apt: any) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permesso negato",
          "Devi concedere i permessi per il calendario per poter aggiungere l'appuntamento.",
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      let targetCalendarId = null;

      if (Platform.OS === "ios") {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        targetCalendarId = defaultCalendar?.id;
      } else {
        const primaryCalendars = calendars.filter(
          (cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER,
        );
        if (primaryCalendars.length > 0) {
          targetCalendarId = primaryCalendars[0].id;
        } else if (calendars.length > 0) {
          targetCalendarId = calendars[0].id;
        }
      }

      if (!targetCalendarId) {
        Alert.alert("Errore", "Nessun calendario trovato sul dispositivo.");
        return;
      }

      const startDate = new Date(apt.scheduled_at);
      const endDate = new Date(
        startDate.getTime() + (apt.service?.duration_minutes ?? 30) * 60000,
      );

      await Calendar.createEventAsync(targetCalendarId, {
        title: `${apt.service?.name ?? "Servizio"} con ${apt.barber?.name ?? "Barbiere"}`,
        startDate,
        endDate,
        notes: `Appuntamento: ${apt.service?.name ?? "Servizio"}`,
      });

      Alert.alert("Successo", "L'appuntamento è stato aggiunto al calendario!");
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Errore",
        "Si è verificato un errore durante l'aggiunta al calendario.",
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4 gap-2">
        <Text
          className="font-sora-bold text-text-primary"
          style={{ fontSize: 28 }}
        >
          I tuoi appuntamenti
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-6 pb-6 flex-row gap-3">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
            className={[
              "px-4 py-2 rounded-pill border",
              activeTab === tab
                ? "bg-accent border-accent"
                : "bg-transparent border-text-secondary",
            ].join(" ")}
          >
            <Text
              className={`font-sora-semibold text-xs ${
                activeTab === tab ? "text-white" : "text-text-secondary"
              }`}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(TABS[e.nativeEvent.position])}
      >
        {TABS.map((tab) => {
          const current = data[tab];
          return (
            <ScrollView
              key={tab}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            >
              {current.length === 0 ? (
                <View className="items-center px-8 mt-16 gap-6">
                  <View className="w-20 h-20 rounded-full bg-accent/[0.08] items-center justify-center">
                    <Ionicons name={EMPTY_STATE[tab].icon} size={36} color={COLORS.accent} />
                  </View>
                  <View className="gap-2 items-center">
                    <Text className="font-sora-bold text-xl text-text-primary text-center">
                      {EMPTY_STATE[tab].title}
                    </Text>
                    <Text className="font-sora text-sm text-text-secondary text-center leading-[22px]">
                      {EMPTY_STATE[tab].subtitle}
                    </Text>
                  </View>
                  {tab === "upcoming" && (
                    <TouchableOpacity
                      onPress={() => router.push("/(app)/(home)")}
                      activeOpacity={0.8}
                      className="w-full h-[54px] rounded-pill bg-accent items-center justify-center"
                    >
                      <Text className="font-sora-bold text-base text-white">Prenota ora</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="px-6 gap-4">
                  {current.map((apt) => {
                    const date = new Date(apt.scheduled_at);
                    const dateStr = date.toLocaleDateString("it-IT", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = date.toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const isPastItem =
                      tab === "past" && apt.status === "confirmed";
                    const badgeVariant = isPastItem ? "completed" : apt.status;

                    return (
                      <Card key={apt.id} className="overflow-hidden">
                        <View className="gap-3">
                          {/* Row 1: nome servizio + badge stato */}
                          <View className="flex-row items-center justify-between">
                            <Text
                              className="font-sora-bold text-base text-text-primary flex-1 mr-2"
                              numberOfLines={1}
                            >
                              {apt.service?.name ?? "Servizio"}
                            </Text>
                            <Badge variant={badgeVariant as any} />
                          </View>

                          {/* Row 2: barbiere */}
                          <View className="gap-1">
                            <Text className="font-sora-semibold text-xs text-text-secondary">
                              Barbiere
                            </Text>
                            <Text className="font-sora-bold text-sm text-text-primary">
                              {apt.barber?.name ?? "Barbiere"}
                            </Text>
                          </View>

                          {/* Row 3: nota (se presente) */}
                          {apt.note && (
                            <View className="flex-row items-start gap-1.5">
                              <Ionicons
                                name="chatbubble-outline"
                                size={13}
                                color={COLORS.textSecondary}
                                style={{ marginTop: 1 }}
                              />
                              <Text className="font-sora text-xs text-text-secondary flex-1" numberOfLines={2}>
                                {apt.note}
                              </Text>
                            </View>
                          )}

                          {/* Row 4: data + ora + prezzo */}
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4">
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
                                  {timeStr} •{" "}
                                  {apt.service?.duration_minutes ?? 30} min
                                </Text>
                              </View>
                            </View>
                            <Text className="font-sora-extrabold text-base text-accent">
                              €{apt.price.toFixed(2)}
                            </Text>
                          </View>

                          {/* Row 4: azioni (solo upcoming) */}
                          {tab === "upcoming" && (
                            <View
                              className="flex-row items-center justify-between pt-3"
                              style={{
                                borderTopWidth: 1,
                                borderTopColor: "rgba(198,198,198,0.1)",
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => handleCancel(apt)}
                                activeOpacity={0.7}
                              >
                                <Text className="font-sora-semibold text-xs text-accent">
                                  Cancella appuntamento
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleAddToCalendar(apt)}
                                activeOpacity={0.7}
                                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full"
                                style={{
                                  backgroundColor: "rgba(250,61,59,0.08)",
                                  borderWidth: 1,
                                  borderColor: "rgba(250,61,59,0.2)",
                                }}
                              >
                                <Ionicons
                                  name="calendar-outline"
                                  size={14}
                                  color={COLORS.accent}
                                />
                                <Text className="font-sora-semibold text-xs text-accent">
                                  Calendario
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </Card>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          );
        })}
      </PagerView>
    </SafeAreaView>
  );
}
