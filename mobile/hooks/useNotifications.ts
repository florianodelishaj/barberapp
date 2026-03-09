import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import {
  registerForPushNotifications,
  savePushToken,
} from "@/lib/notifications";

export function useNotifications() {
  const { session } = useAuthStore();
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;

    // Register and save push token
    registerForPushNotifications().then((token) => {
      if (token) {
        savePushToken(session.user.id, token);
      }
    });

    // Listener: user tapped a notification → deep link
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "cancellation" || data?.type === "reminder") {
          router.push("/(app)/(orders)");
        } else if (data?.type === "profile_approved") {
          router.replace("/(app)/(home)");
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, [session?.user.id]);
}
