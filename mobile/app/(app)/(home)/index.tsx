import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '@/hooks/useServices';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/lib/tokens';

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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View className="px-6 pt-6 pb-8 gap-4">
          <Text className="font-sora-extrabold text-text-primary" style={{ fontSize: 28 }}>
            Prenota il tuo taglio
          </Text>
          <Text className="font-sora-light text-sm text-text-secondary leading-5">
            Scegli il servizio che desideri e prenota con i migliori barbieri della città
          </Text>
        </View>

        {/* Services Grid */}
        <View className="px-6 gap-3">
          {services.map((service) => (
            <Card key={service.id} className="p-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-sora-bold text-base text-text-primary">
                  {service.name}
                </Text>
                <View className="flex-row gap-3 mt-1">
                  <Text className="font-sora text-xs text-text-secondary">
                    {service.duration_minutes}min
                  </Text>
                  <Text className="font-sora-bold text-sm text-accent">
                    €{service.price.toFixed(2)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: '/(app)/(home)/calendar',
                    params: { serviceId: service.id },
                  });
                }}
                activeOpacity={0.7}
                className="w-10 h-10 rounded-pill bg-accent items-center justify-center"
              >
                <Text className="font-sora-bold text-white text-lg">+</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
