import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { useState } from "react";
import { COLORS } from "@/lib/tokens";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  isPassword?: boolean;
  error?: string;
}

export function Input({ label, icon, isPassword, error, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="gap-2">
      {label && (
        <Text className="font-sora-semibold text-xs uppercase tracking-[0.6px] text-text-secondary px-2">
          {label}
        </Text>
      )}
      <View
        className={[
          "h-[54px] flex-row items-center bg-surface rounded-input px-4 gap-3",
          "border",
          error ? "border-accent" : "border-[rgba(198,198,198,0.1)]",
          props.editable === false ? "opacity-60" : "",
        ].join(" ")}
      >
        {icon && (
          <View className="w-8 h-8 rounded-full bg-accent/[0.08] items-center justify-center shrink-0">
            <Ionicons name={icon} size={16} color={COLORS.accent} />
          </View>
        )}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={`${COLORS.textPrimary}80`}
          className="flex-1 font-sora text-base text-text-primary"
          style={{
            paddingRight: isPassword ? 40 : 0,
            height: 54,
            lineHeight: 0,
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="font-sora text-sm text-accent">{error}</Text>}
    </View>
  );
}
