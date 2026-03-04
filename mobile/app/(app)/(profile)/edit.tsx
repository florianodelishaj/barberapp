import { View, Text, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Card } from '@/components/ui/Card';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.full_name,
      email: '',
      phone: profile.phone ?? '',
      birthDate: profile.birth_date ?? '',
    });
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setForm((f) => ({ ...f, email: data.user.email ?? '' }));
      }
    });
  }, [profile]);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function handleSave() {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.fullName,
        phone: form.phone,
        birth_date: form.birthDate || null,
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      setProfile({ ...profile, full_name: form.fullName, phone: form.phone });
      Alert.alert('Successo', 'Profilo aggiornato', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }

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
        <View className="px-6 pt-6 pb-6 gap-4 flex-row items-start">
          <BackButton />
          <Text className="font-sora-bold text-lg text-text-primary flex-1">Modifica profilo</Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-4 pb-8">
          <Input
            label="Nome completo"
            value={form.fullName}
            onChangeText={set('fullName')}
            editable
          />
          <Input
            label="Email"
            value={form.email}
            onChangeText={set('email')}
            editable={false}
            keyboardType="email-address"
          />
          <Input
            label="Telefono"
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
          />
          <Input
            label="Data di nascita"
            value={form.birthDate}
            onChangeText={set('birthDate')}
            placeholder="YYYY-MM-DD"
          />

          <Card className="p-3 mt-2">
            <Text className="font-sora text-xs text-text-secondary leading-4">
              Le tue informazioni personali sono protette e non verranno condivise con terze parti.
            </Text>
          </Card>
        </View>

        {/* Buttons */}
        <View className="px-6 gap-3">
          <Button label="SALVA MODIFICHE" onPress={handleSave} loading={loading} />
          <Button label="Annulla" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
