import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { supabase } from "./supabase";

const PUSH_TOKEN_KEY = "@push_token";

/** Request permissions and get the Expo push token. Returns null on simulator or if denied. */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Android: create notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FA3D3B",
    });
  }

  // Check / request permissions
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data; // "ExponentPushToken[xxx]"
}

/** Save push token to Supabase, handling token refresh (old token cleanup). */
export async function savePushToken(
  userId: string,
  token: string
): Promise<void> {
  const platform = Platform.OS as "ios" | "android";

  // Check if token changed since last save
  const previousToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

  if (previousToken && previousToken !== token) {
    // Token changed (reinstall, OS update, etc.) — delete old one
    await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("token", previousToken);
  }

  // Upsert current token
  await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,token" }
  );

  // Persist token locally for future comparison
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
}

/** Remove push token from Supabase (call on logout). */
export async function removePushToken(): Promise<void> {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  if (!token) return;

  await supabase.from("push_tokens").delete().eq("token", token);
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}
