import { View, Text, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/lib/tokens';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/splash-icon.png')}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Gradient overlay */}
      <View
        className="absolute inset-0"
        style={{ backgroundColor: COLORS.background, opacity: 0.88 }}
      />
      <SafeAreaView className="flex-1 justify-end pb-10">
        <View className="px-6 gap-6">
          {/* Logo + Titolo */}
          <View className="items-center gap-4 mb-8">
            <Text className="font-sora-extrabold text-center" style={{ fontSize: 48, letterSpacing: -1.44 }}>
              <Text className="text-text-primary">Barber</Text>
              <Text className="text-accent">X</Text>
            </Text>
            <Text className="font-sora-light text-base text-text-secondary text-center leading-6">
              L'arte del taglio perfetto.{'\n'}Prenota con i migliori barbieri della città.
            </Text>
          </View>

          {/* Bottoni */}
          <Button label="Accedi" onPress={() => router.push('/(auth)/login')} />
          <Button label="Registrati" variant="ghost" onPress={() => router.push('/(auth)/register')} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
