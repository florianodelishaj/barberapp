import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/ui/BackButton';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof typeof form) {
    return (val: string) => setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleRegister() {
    if (form.password !== form.confirm) {
      setError('Le password non coincidono');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Errore durante la registrazione');
      setLoading(false);
      return;
    }

    // Crea profilo con status "pending"
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: form.fullName,
      phone: form.phone,
      status: 'pending',
    });

    setLoading(false);
    // L'AuthGuard reindirizzerà a /pending automaticamente
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-6 gap-8">
          <View className="gap-4">
            <BackButton />
            <View className="gap-1">
              <Text className="font-sora-bold text-xl text-text-primary">Crea account</Text>
              <Text className="font-sora-light text-sm text-text-secondary">Inserisci i tuoi dati</Text>
            </View>
          </View>

          <View className="gap-4">
            <Input placeholder="Nome e Cognome" value={form.fullName} onChangeText={set('fullName')} />
            <Input placeholder="Numero di telefono" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
            <Input placeholder="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
            <Input placeholder="Password" value={form.password} onChangeText={set('password')} isPassword />
            <Input placeholder="Conferma Password" value={form.confirm} onChangeText={set('confirm')} isPassword />
          </View>

          {error ? <Text className="font-sora text-sm text-accent text-center">{error}</Text> : null}

          <Button label="Registrati" onPress={handleRegister} loading={loading} />

          <View className="flex-row justify-center gap-1">
            <Text className="font-sora text-sm text-text-secondary">Hai già un account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="font-sora-semibold text-sm text-accent">Accedi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
