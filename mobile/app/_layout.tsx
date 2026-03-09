import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import {
  useFonts,
  Sora_300Light,
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import { useAuthListener } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { COLORS } from "@/lib/tokens";

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { session, profile, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      const isGatedScreen = segments[1] === "pending" || segments[1] === "rejected";
      if (!inAuthGroup || isGatedScreen) router.replace("/(auth)");
      return;
    }

    if (profile?.status === "pending") {
      if (!inAuthGroup || segments[1] !== "pending") {
        router.replace("/(auth)/pending");
      }
      return;
    }

    if (profile?.status === "rejected") {
      if (!inAuthGroup || segments[1] !== "rejected") {
        router.replace("/(auth)/rejected");
      }
      return;
    }

    if (profile?.status === "approved" || profile?.status === undefined) {
      if (inAuthGroup) {
        router.replace("/(app)/(home)");
      }
    }
  }, [session, profile, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  useAuthListener();
  const { isLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
