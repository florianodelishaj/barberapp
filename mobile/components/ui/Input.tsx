import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { useState } from 'react';
import { COLORS } from '@/lib/tokens';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  isPassword?: boolean;
  error?: string;
}

export function Input({ label, isPassword, error, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="font-sora-semibold text-sm text-text-secondary">{label}</Text>
      )}
      <View
        className={[
          'h-[54px] flex-row items-center bg-surface rounded-input px-5',
          'border',
          error ? 'border-accent' : 'border-text-secondary',
        ].join(' ')}
      >
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={`${COLORS.textPrimary}80`}
          className="flex-1 font-sora text-base text-text-primary"
          style={{ paddingRight: isPassword ? 48 : 0 }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="font-sora text-sm text-accent">{error}</Text>
      )}
    </View>
  );
}
