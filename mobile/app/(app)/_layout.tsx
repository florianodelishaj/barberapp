import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/lib/tokens";
import { useBookingStore } from "@/store/bookingStore";
import { useNotifications } from "@/hooks/useNotifications";

function TabIcon({
  name,
  label,
  focused,
}: {
  name: any;
  label: string;
  focused: boolean;
}) {
  const color = focused ? COLORS.accent : COLORS.textSecondary;
  return (
    <View style={{ alignItems: "center", gap: 2, paddingTop: 14, width: 128 }}>
      <Ionicons name={name} size={22} color={color} />
      <Text
        style={{
          fontFamily: "Sora_600SemiBold",
          fontSize: 10,
          color,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  useNotifications();
  const resetBooking = useBookingStore((state) => state.reset);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              label="Home"
              focused={focused}
            />
          ),
        }}
        listeners={() => ({
          tabPress: () => {
            resetBooking();
          },
        })}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "calendar" : "calendar-outline"}
              label="Prenotazioni"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              label="Profilo"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
