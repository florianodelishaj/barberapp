import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useAppointments } from "@/hooks/useAppointments";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/lib/tokens";
import { removePushToken } from "@/lib/notifications";
import { useCallback } from "react";

function SmallIconCircle({ name }: { name: any }) {
  return (
    <View className="w-8 h-8 rounded-full bg-accent/[0.08] items-center justify-center">
      <Ionicons name={name} size={14} color={COLORS.accent} />
    </View>
  );
}

function LargeIconCircle({ name }: { name: any }) {
  return (
    <View className="w-10 h-10 rounded-full bg-accent/[0.08] items-center justify-center">
      <Ionicons name={name} size={20} color={COLORS.accent} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { upcoming, refetch } = useAppointments();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const handleLogout = async () => {
    Alert.alert("Esci", "Sei sicuro?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Esci",
        style: "destructive",
        onPress: async () => {
          await removePushToken();
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6 gap-4">
        <Text className="font-sora-semibold text-text-primary text-center">
          Impossibile caricare il profilo.
        </Text>
        <Text className="font-sora text-sm text-text-secondary text-center">
          Verifica la connessione o riprova ad accedere.
        </Text>
        <Button
          label="Esci dall'account"
          variant="ghost"
          onPress={async () => {
            await removePushToken();
            await supabase.auth.signOut();
          }}
        />
      </SafeAreaView>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "it-IT",
    { month: "long", year: "numeric" },
  );

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();

  const totalMinutes = upcoming.reduce((sum, a) => sum + a.duration_minutes, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Text className="font-sora-bold text-[28px] tracking-[-0.56px] text-text-primary">
            Profilo
          </Text>
        </View>

        {/* User Info Card */}
        <View className="px-6 pb-6">
          <Card className="overflow-hidden">
            <View className="gap-6">
              {/* Avatar + name */}
              <View className="flex-row items-center gap-4">
                <View className="w-20 h-20 rounded-card border border-accent bg-accent/[0.08] items-center justify-center">
                  <Text className="font-sora-bold text-2xl text-accent">
                    {initials}
                  </Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text
                    className="font-sora-bold text-xl text-text-primary"
                    numberOfLines={1}
                  >
                    {fullName}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={COLORS.textSecondary}
                    />
                    <Text className="font-sora text-xs text-text-secondary">
                      Membro da {memberSince}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact rows */}
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <SmallIconCircle name="mail-outline" />
                  <Text
                    className="font-sora text-sm text-text-primary flex-1"
                    numberOfLines={1}
                  >
                    {profile.email ?? "—"}
                  </Text>
                </View>

                {profile.phone ? (
                  <View className="flex-row items-center gap-3">
                    <SmallIconCircle name="call-outline" />
                    <Text className="font-sora text-sm text-text-primary">
                      {profile.phone}
                    </Text>
                  </View>
                ) : null}

                {profile.birth_date ? (
                  <View className="flex-row items-center gap-3">
                    <SmallIconCircle name="calendar-outline" />
                    <Text className="font-sora text-sm text-text-primary">
                      {new Date(profile.birth_date).toLocaleDateString(
                        "it-IT",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View className="px-6 pb-6 flex-row gap-3">
          <Card className="flex-1 overflow-hidden">
            <View className="items-center gap-2">
              <LargeIconCircle name="calendar-outline" />
              <Text className="font-sora-extrabold text-2xl text-accent leading-8">
                {upcoming.length}
              </Text>
              <Text className="font-sora-semibold text-[10px] text-text-secondary text-center">
                Appuntamenti
              </Text>
            </View>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <View className="items-center gap-2">
              <LargeIconCircle name="time-outline" />
              <Text className="font-sora-extrabold text-2xl text-accent leading-8">
                {Math.round(totalMinutes / 60)}h
              </Text>
              <Text className="font-sora-semibold text-[10px] text-text-secondary text-center">
                Ore totali
              </Text>
            </View>
          </Card>
        </View>

        {/* Menu */}
        <View className="px-6 gap-6">
          {/* Account */}
          <View className="gap-2">
            <Text className="font-sora-semibold text-[12px] uppercase tracking-[0.6px] text-text-secondary px-2">
              Account
            </Text>
            <Card className="overflow-hidden py-0">
              <TouchableOpacity
                onPress={() => router.push("/(app)/(profile)/edit")}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 pb-4 border-b border-b-[rgba(198,198,198,0.1)]"
              >
                <LargeIconCircle name="person-outline" />
                <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                  Modifica profilo
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/(profile)/security")}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 pt-4"
              >
                <LargeIconCircle name="lock-closed-outline" />
                <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                  Sicurezza e password
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Altro */}
          <View className="gap-2">
            <Text className="font-sora-semibold text-[12px] uppercase tracking-[0.6px] text-text-secondary px-2">
              Altro
            </Text>
            <Card className="overflow-hidden">
              <TouchableOpacity
                onPress={() => {}}
                activeOpacity={0.7}
                className="flex-row items-center gap-3"
              >
                <LargeIconCircle name="help-circle-outline" />
                <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                  Aiuto e supporto
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center gap-3 rounded-card px-6 py-4 bg-accent/[0.08] border border-accent/20"
          >
            <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
            </View>
            <Text className="font-sora-bold text-sm text-accent flex-1">
              Esci dall'account
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="pt-8 pb-2 items-center">
          <Text className="font-sora text-xs text-text-muted">
            BarberX v1.0.0 • © 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
