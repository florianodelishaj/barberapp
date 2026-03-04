import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/tokens';

export function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      className="w-10 h-10 rounded-pill items-center justify-center border"
      style={{
        backgroundColor: COLORS.accentTint,
        borderColor: COLORS.accent,
      }}
    >
      <Ionicons name="chevron-back" size={18} color={COLORS.accent} />
    </TouchableOpacity>
  );
}
