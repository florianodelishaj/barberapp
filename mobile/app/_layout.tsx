import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
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

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { session, profile, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      if (!inAuthGroup) router.replace("/(auth)");
      return;
    }

    if (profile?.status === "pending") {
      router.replace("/(auth)/pending");
      return;
    }

    // Riidireziona all'app se l'utente è in area auth
    // (approved esplicito, o profilo null/senza status specificato)
    if (inAuthGroup) {
      router.replace("/(app)/(home)");
    }
  }, [session, profile, isLoading]);

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
