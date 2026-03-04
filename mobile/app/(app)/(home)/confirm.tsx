import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ConfirmScreen() {
  const router = useRouter();
  const { service, date, slot, barber, reset } = useBookingStore();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (!service || !date || !slot || !barber) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="font-sora text-sm text-text-secondary">Dati prenotazione incompleti</Text>
      </SafeAreaView>
    );
  }

  const dateObj = new Date(`${date}T${slot}:00`);
  const dateStr = dateObj.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = slot;

  async function handleConfirm() {
    if (!session) return;
    setLoading(true);

    const { error } = await supabase.from('appointments').insert({
      user_id: session.user.id,
      barber_id: barber.id,
      service_id: service.id,
      scheduled_at: dateObj.toISOString(),
      duration_minutes: service.duration_minutes,
      price: service.price,
      status: 'confirmed',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Successo', 'Prenotazione confermata!', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            router.replace('/(app)/(orders)');
          },
        },
      ]);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-6">
      <View className="mb-6 gap-4 flex-row items-start">
        <BackButton />
        <Text className="font-sora-bold text-lg text-text-primary flex-1">Conferma prenotazione</Text>
      </View>

      <View className="flex-1 gap-4">
        {/* Service Card */}
        <Card className="p-4 gap-3">
          <Text className="font-sora-semibold text-xs text-text-secondary">Servizio</Text>
          <Text className="font-sora-bold text-base text-text-primary">{service.name}</Text>
          <View className="flex-row gap-4 mt-1">
            <View>
              <Text className="font-sora text-xs text-text-secondary">Durata</Text>
              <Text className="font-sora-bold text-sm text-text-primary mt-1">
                {service.duration_minutes}min
              </Text>
            </View>
            <View>
              <Text className="font-sora text-xs text-text-secondary">Prezzo</Text>
              <Text className="font-sora-bold text-sm text-accent mt-1">
                €{service.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Barber Card */}
        <Card className="p-4 gap-2">
          <Text className="font-sora-semibold text-xs text-text-secondary">Barbiere</Text>
          <Text className="font-sora-bold text-base text-text-primary">{barber.name}</Text>
        </Card>

        {/* DateTime Card */}
        <Card className="p-4 gap-3">
          <Text className="font-sora-semibold text-xs text-text-secondary">Data e ora</Text>
          <View className="gap-2">
            <Text className="font-sora-bold text-sm text-text-primary">{dateStr}</Text>
            <Text className="font-sora-bold text-sm text-accent">{timeStr}</Text>
          </View>
          <Badge variant="confirmed" label="Confermato" />
        </Card>
      </View>

      {/* Buttons */}
      <View className="gap-3 pt-6">
        <Button label="Conferma prenotazione" onPress={handleConfirm} loading={loading} />
        <Button
          label="Annulla"
          variant="ghost"
          onPress={() => {
            reset();
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
