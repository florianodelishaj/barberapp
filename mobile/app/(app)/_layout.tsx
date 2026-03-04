import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/tokens';

function TabIcon({ name, label, focused }: { name: any; label: string; focused: boolean }) {
  const color = focused ? COLORS.accent : COLORS.textSecondary;
  return (
    <View className="items-center gap-0.5 pt-2">
      <Ionicons name={name} size={22} color={color} />
      <Text className="font-sora-semibold" style={{ fontSize: 10, color }}>{label}</Text>
    </View>
  );
}

export default function AppLayout() {
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
            <TabIcon name={focused ? 'home' : 'home-outline'} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} label="Ordini" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} label="Profilo" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
