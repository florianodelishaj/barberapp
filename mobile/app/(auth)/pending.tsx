import { View, Text } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { removePushToken } from "@/lib/notifications";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { COLORS } from "@/lib/tokens";
import { Ionicons } from "@expo/vector-icons";

export default function PendingScreen() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await removePushToken();
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-full max-w-md gap-6">
        <Card className="gap-5 overflow-hidden">
          {/* Icona */}
          <View className="items-center">
            <View className="w-16 h-16 rounded-pill bg-accent/[0.08] items-center justify-center">
              <Ionicons name="time-outline" size={32} color={COLORS.accent} />
            </View>
          </View>

          {/* Testo */}
          <View className="gap-3 items-center">
            <Text className="font-sora-bold text-lg text-text-primary text-center">
              Account in attesa
            </Text>
            <Text className="font-sora-light text-sm text-text-secondary text-center leading-[22px]">
              Il tuo account è stato creato con successo. Un amministratore
              verificherà il tuo profilo e riceverai una notifica appena sarà
              approvato.
            </Text>
          </View>

          <View className="items-center">
            <Badge variant="pending" />
          </View>
        </Card>

        <View className="w-full">
          <Button
            label="Disconnetti"
            variant="ghost"
            onPress={handleLogout}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
