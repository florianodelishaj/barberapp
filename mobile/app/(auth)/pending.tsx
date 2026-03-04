import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function PendingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="bg-surface rounded-[24px] p-6 gap-5 w-full overflow-hidden">
        {/* Accent strip sinistra */}
        <View
          className="absolute left-0 top-0 bottom-0 w-3"
          style={{ backgroundColor: `${COLORS.accent}40` }}
        />

        {/* Icona */}
        <View className="items-center">
          <View
            className="w-16 h-16 rounded-pill items-center justify-center"
            style={{ backgroundColor: COLORS.accentTint }}
          >
            <Ionicons name="time-outline" size={32} color={COLORS.accent} />
          </View>
        </View>

        {/* Testo */}
        <View className="gap-3 items-center">
          <Text className="font-sora-bold text-lg text-text-primary text-center">
            Account in attesa
          </Text>
          <Text className="font-sora-light text-sm text-text-secondary text-center leading-[22px]">
            Il tuo account è stato creato con successo. Un amministratore verificherà il tuo profilo e riceverai una notifica appena sarà approvato.
          </Text>
        </View>

        <View className="items-center">
          <Badge variant="pending" />
        </View>
      </View>

      <View className="mt-8 w-full">
        <Button
          label="Esci"
          variant="ghost"
          onPress={() => supabase.auth.signOut()}
        />
      </View>
    </SafeAreaView>
  );
}
