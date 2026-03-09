import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useServices } from "@/hooks/useServices";
import { Card } from "@/components/ui/Card";
import { COLORS } from "@/lib/tokens";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const { services, loading } = useServices();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <ImageBackground
          source={require("@/assets/hero_home.jpg")}
          resizeMode="cover"
          style={{ height: 220 }}
        >
          <View
            className="absolute inset-0"
            style={{ backgroundColor: COLORS.background, opacity: 0.55 }}
          />
          <View className="flex-1 justify-end gap-2 p-6">
            <Text
              className="font-sora-extrabold text-text-primary"
              style={{ fontSize: 28 }}
            >
              Prenota il tuo taglio
            </Text>
            <Text className="font-sora-light text-sm text-text-secondary leading-5">
              Scegli il servizio che desideri e prenota con i migliori barbieri
              della città
            </Text>
          </View>
        </ImageBackground>

        {/* Services Grid */}
        <View className="px-6 gap-3 mt-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="flex-row items-stretch overflow-hidden"
            >
              {/* Contenuto */}
              <View className="flex-1 flex-row items-center justify-between">
                <View className="flex-1 gap-1.5">
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

                {/* Prezzo + Pulsante */}
                <View className="items-end gap-2">
                  <Text className="font-sora-bold text-base text-accent">
                    €{service.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/(app)/(home)/calendar",
                        params: { serviceId: service.id },
                      });
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: COLORS.accentTint,
                      borderColor: COLORS.accent,
                      borderWidth: 1,
                    }}
                    className="w-9 h-9 rounded-pill items-center justify-center"
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.accent}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
