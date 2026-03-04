import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useSlots } from '@/hooks/useSlots';
import { mcp__supabase__execute_sql } from '@/lib/supabase';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/lib/tokens';
import { supabase } from '@/lib/supabase';

export default function CalendarScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { setDate } = useBookingStore();
  const { barberSlots, loading } = useSlots(selectedDate, service?.duration_minutes ?? 30);

  useEffect(() => {
    if (!serviceId) return;
    supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()
      .then(({ data }) => setService(data));
  }, [serviceId]);

  const nextDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleSelectDate = (date: Date) => {
    const iso = date.toISOString().split('T')[0];
    setSelectedDate(iso);
    setDate(iso);
  };

  const handleSelectSlot = (slot: string, barber: any) => {
    useBookingStore.setState({ slot, barber });
    router.push('/(app)/(home)/confirm');
  };

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-6 gap-4 flex-row items-start">
          <BackButton />
          <View className="flex-1">
            <Text className="font-sora-bold text-base text-text-primary">{service.name}</Text>
            <Text className="font-sora text-xs text-text-secondary mt-1">
              {service.duration_minutes}min • €{service.price.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Date Picker */}
        <View className="px-6 pb-6 gap-3">
          <Text className="font-sora-semibold text-sm text-text-secondary">Seleziona data</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {nextDays.map((date, idx) => {
              const iso = date.toISOString().split('T')[0];
              const isSelected = selectedDate === iso;
              const dayName = date.toLocaleDateString('it-IT', { weekday: 'short' });
              const dayNum = date.getDate();

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectDate(date)}
                  activeOpacity={0.7}
                  className={[
                    'px-4 py-3 rounded-input border items-center min-w-[80px]',
                    isSelected
                      ? 'bg-accent border-accent'
                      : 'bg-surface border-text-secondary',
                  ].join(' ')}
                >
                  <Text
                    className={`font-sora-semibold text-xs ${
                      isSelected ? 'text-white' : 'text-text-secondary'
                    }`}
                  >
                    {dayName}
                  </Text>
                  <Text
                    className={`font-sora-bold text-base ${
                      isSelected ? 'text-white' : 'text-text-primary'
                    } mt-1`}
                  >
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Slots by Barber */}
        {selectedDate && (
          <View className="px-6 gap-4">
            <Text className="font-sora-semibold text-sm text-text-secondary">Scegli barbiere e orario</Text>
            {loading ? (
              <ActivityIndicator color={COLORS.accent} />
            ) : barberSlots.length === 0 ? (
              <Card className="p-4">
                <Text className="font-sora text-sm text-text-secondary text-center">
                  Nessuno slot disponibile per questa data
                </Text>
              </Card>
            ) : (
              barberSlots.map((bs) => (
                <Card key={bs.barber.id} className="p-4 gap-3">
                  <Text className="font-sora-bold text-base text-text-primary">
                    {bs.barber.name}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {bs.slots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        onPress={() => handleSelectSlot(slot, bs.barber)}
                        activeOpacity={0.7}
                        className="px-3 py-2 rounded-input bg-surface border border-accent"
                      >
                        <Text className="font-sora-semibold text-xs text-accent">{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
