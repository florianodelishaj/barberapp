import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BackButton } from "@/components/ui/BackButton";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="flex-1 px-6 pt-6 gap-8">
          {/* Header */}
          <View className="gap-4">
            <BackButton />
            <View className="gap-1">
              <Text className="font-sora-bold text-xl text-text-primary">
                Bentornato
              </Text>
              <Text className="font-sora-light text-sm text-text-secondary">
                Accedi al tuo account
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Input
              label={undefined}
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            <TouchableOpacity
              className="self-end"
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text className="font-sora-semibold text-xs text-accent">
                Password dimenticata?
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text className="font-sora text-sm text-accent text-center">
              {error}
            </Text>
          ) : null}

          <Button label="Accedi" onPress={handleLogin} loading={loading} />

          {/* Link registrazione */}
          <View className="flex-row justify-center gap-1">
            <Text className="font-sora text-sm text-text-secondary">
              Non hai un account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="font-sora-semibold text-sm text-accent">
                Registrati
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
