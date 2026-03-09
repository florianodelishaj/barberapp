import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/ui/BackButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert(
        'Email inviata',
        'Controlla la tua casella di posta per reimpostare la password.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View className="flex-1 px-6 pt-6 gap-8">
          <View className="gap-4">
            <BackButton />
            <View className="gap-1">
              <Text className="font-sora-bold text-xl text-text-primary">Password dimenticata?</Text>
              <Text className="font-sora-light text-sm text-text-secondary leading-[21px]">
                Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <Input
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button label="Invia" onPress={handleSend} loading={loading} />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="font-sora text-sm text-text-secondary">Ricordi la password?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="font-sora-semibold text-sm text-accent">Accedi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
