import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/lib/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={[
        'h-[54px] w-full rounded-pill items-center justify-center',
        isPrimary ? 'bg-accent' : 'bg-transparent border border-accent',
        (disabled || loading) ? 'opacity-50' : '',
      ].join(' ')}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.accent} />
      ) : (
        <Text
          className={[
            'font-sora-bold text-base',
            isPrimary ? 'text-white' : 'text-accent',
          ].join(' ')}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
