import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAppointments } from '@/hooks/useAppointments';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { upcoming } = useAppointments();

  const handleLogout = async () => {
    Alert.alert('Esci', 'Sei sicuro?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="font-sora text-text-secondary">Caricamento...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-6 gap-2">
          <Text className="font-sora-bold text-text-primary" style={{ fontSize: 28 }}>
            Profilo
          </Text>
        </View>

        {/* User Info Card */}
        <View className="px-6 pb-6">
          <Card className="p-6 gap-4">
            {/* Avatar */}
            <View className="w-16 h-16 rounded-pill bg-accent items-center justify-center self-start">
              <Text className="font-sora-bold text-xl text-white">
                {profile.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>

            {/* User Details */}
            <View className="gap-3">
              <View>
                <Text className="font-sora-semibold text-xs text-text-secondary">Nome</Text>
                <Text className="font-sora-bold text-base text-text-primary mt-1">
                  {profile.full_name}
                </Text>
              </View>
              <View>
                <Text className="font-sora-semibold text-xs text-text-secondary">Membro da</Text>
                <Text className="font-sora text-sm text-text-primary mt-1">
                  {new Date(profile.created_at).toLocaleDateString('it-IT', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              {profile.phone && (
                <View>
                  <Text className="font-sora-semibold text-xs text-text-secondary">Telefono</Text>
                  <Text className="font-sora text-sm text-text-primary mt-1">{profile.phone}</Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View className="px-6 pb-6 flex-row gap-3">
          <Card className="flex-1 p-4 items-center gap-2">
            <Text className="font-sora-extrabold text-2xl text-accent">{upcoming.length}</Text>
            <Text className="font-sora-semibold text-xs text-text-secondary text-center">
              Appuntamenti
            </Text>
          </Card>
          <Card className="flex-1 p-4 items-center gap-2">
            <Text className="font-sora-extrabold text-2xl text-accent">
              {Math.round(upcoming.reduce((sum, a) => sum + a.duration_minutes, 0) / 60)}h
            </Text>
            <Text className="font-sora-semibold text-xs text-text-secondary text-center">
              Ore totali
            </Text>
          </Card>
        </View>

        {/* Menu */}
        <View className="px-6 pb-6 gap-4">
          {/* Account Section */}
          <View>
            <Text className="font-sora-semibold text-xs text-text-secondary mb-2">Account</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(profile)/edit')}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3 px-4 bg-surface rounded-card"
            >
              <Ionicons name="pencil-outline" size={18} color={COLORS.accent} />
              <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                Modifica profilo
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/(profile)/security')}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3 px-4 bg-surface rounded-card mt-2"
            >
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.accent} />
              <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                Sicurezza e password
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Other Section */}
          <View>
            <Text className="font-sora-semibold text-xs text-text-secondary mb-2">Altro</Text>
            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3 px-4 bg-surface rounded-card"
            >
              <Ionicons name="help-circle-outline" size={18} color={COLORS.accent} />
              <Text className="font-sora-semibold text-sm text-text-primary flex-1">
                Aiuto e supporto
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View className="px-6 pt-6">
          <Button label="Esci dall'account" variant="ghost" onPress={handleLogout} />
        </View>

        {/* Footer */}
        <View className="px-6 pt-6 items-center">
          <Text className="font-sora text-xs text-text-muted">BarberX v1.0.0 • © 2024</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
