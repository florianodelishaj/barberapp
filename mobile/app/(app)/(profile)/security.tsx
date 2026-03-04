import { View, Text, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Card } from '@/components/ui/Card';

export default function SecurityScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function handleUpdate() {
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }

    if (form.newPassword.length < 8) {
      Alert.alert('Errore', 'La password deve essere di almeno 8 caratteri');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: form.newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Successo', 'Password aggiornata', [
        {
          text: 'OK',
          onPress: () => {
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            router.back();
          },
        },
      ]);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-6 gap-4 flex-row items-start">
          <BackButton />
          <Text className="font-sora-bold text-lg text-text-primary flex-1">Sicurezza</Text>
        </View>

        {/* Description */}
        <View className="px-6 pb-6">
          <Text className="font-sora text-sm text-text-secondary leading-5">
            Modifica la tua password per mantenere il tuo account sicuro
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-4 pb-8">
          <Input
            label="Password attuale"
            value={form.currentPassword}
            onChangeText={set('currentPassword')}
            isPassword
            placeholder="Inserisci password attuale"
            editable={false}
          />
          <Input
            label="Nuova password"
            value={form.newPassword}
            onChangeText={set('newPassword')}
            isPassword
            placeholder="Inserisci nuova password"
          />
          <Input
            label="Conferma password"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            isPassword
            placeholder="Conferma nuova password"
          />

          {/* Requirements */}
          <Card className="p-4 gap-2 mt-2">
            <Text className="font-sora-semibold text-xs text-accent">Requisiti password:</Text>
            <View className="gap-1">
              {[
                '• Minimo 8 caratteri',
                '• Almeno una lettera maiuscola',
                '• Almeno un numero',
                '• Almeno un carattere speciale',
              ].map((req, i) => (
                <Text key={i} className="font-sora text-xs text-text-secondary">
                  {req}
                </Text>
              ))}
            </View>
          </Card>
        </View>

        {/* Buttons */}
        <View className="px-6 gap-3">
          <Button label="AGGIORNA PASSWORD" onPress={handleUpdate} loading={loading} />
          <Button label="Annulla" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
