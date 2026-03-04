import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '@/hooks/useAppointments';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/tokens';
import { useRouter } from 'expo-router';

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { upcoming, past, cancelled, loading, cancelAppointment } = useAppointments();

  const data = {
    upcoming,
    past,
    cancelled,
  };

  const current = data[activeTab];

  const handleCancel = (id: string) => {
    Alert.alert('Cancella prenotazione', 'Sei sicuro?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => cancelAppointment(id),
      },
    ]);
  };

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
        {/* Header */}
        <View className="px-6 pt-6 pb-6 gap-2">
          <Text className="font-sora-bold text-text-primary" style={{ fontSize: 28 }}>
            I tuoi appuntamenti
          </Text>
        </View>

        {/* Tabs */}
        <View className="px-6 pb-6 flex-row gap-3">
          {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={[
                'px-4 py-2 rounded-pill border',
                activeTab === tab
                  ? 'bg-accent border-accent'
                  : 'bg-transparent border-text-secondary',
              ].join(' ')}
            >
              <Text
                className={`font-sora-semibold text-xs ${
                  activeTab === tab ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {tab === 'upcoming'
                  ? 'Prossimi'
                  : tab === 'past'
                    ? 'Passati'
                    : 'Cancellati'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Appointments */}
        {current.length === 0 ? (
          <View className="px-6 items-center gap-3">
            <Text className="font-sora-light text-base text-text-secondary text-center">
              Nessun appuntamento
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                onPress={() => router.push('/(app)/(home)')}
                className="mt-2 px-4 py-2 rounded-pill bg-accent"
              >
                <Text className="font-sora-bold text-xs text-white">Prenota ora</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="px-6 gap-3">
            {current.map((apt) => {
              const date = new Date(apt.scheduled_at);
              const dateStr = date.toLocaleDateString('it-IT', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Card key={apt.id} className="p-4 gap-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="font-sora-bold text-base text-text-primary">
                        {apt.service?.name ?? 'Servizio'}
                      </Text>
                      <Text className="font-sora text-xs text-text-secondary mt-1">
                        {apt.barber?.name ?? 'Barbiere'}
                      </Text>
                    </View>
                    <Badge variant={apt.status as any} />
                  </View>
                  <View className="flex-row gap-4 text-xs">
                    <Text className="font-sora text-text-secondary">
                      <Text className="font-sora-bold">{dateStr}</Text>
                    </Text>
                    <Text className="font-sora text-text-secondary">
                      <Text className="font-sora-bold">{timeStr}</Text>
                    </Text>
                    <Text className="font-sora-bold text-accent">€{apt.price.toFixed(2)}</Text>
                  </View>
                  {activeTab === 'upcoming' && (
                    <View className="flex-row gap-2 pt-2">
                      <TouchableOpacity
                        className="flex-1 py-2 px-3 rounded-input bg-surface border border-accent"
                        onPress={() => handleCancel(apt.id)}
                      >
                        <Text className="font-sora-semibold text-xs text-accent text-center">
                          Cancella
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
