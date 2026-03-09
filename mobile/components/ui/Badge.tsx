import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/lib/tokens";

type BadgeVariant = "pending" | "confirmed" | "cancelled" | "completed" | "rejected";

const CONFIG: Record<
  BadgeVariant,
  { label: string; color: string; bgColor?: string; borderColor?: string }
> = {
  pending: { label: "In attesa di approvazione", color: COLORS.accent },
  confirmed: { label: "Confermato", color: COLORS.success },
  cancelled: {
    label: "Cancellato",
    color: COLORS.accent,
    bgColor: COLORS.accentTint,
    borderColor: COLORS.accent,
  },
  completed: { label: "Eseguito", color: COLORS.textSecondary },
  rejected: {
    label: "Non approvato",
    color: COLORS.accent,
    bgColor: COLORS.accentTint,
    borderColor: COLORS.accent,
  },
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function Badge({ variant, label }: BadgeProps) {
  const config = CONFIG[variant];
  const { label: defaultLabel, color, bgColor, borderColor } = config;
  const text = label ?? defaultLabel;

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: Math.max(0, 3.5 - scale.value),
  }));

  return (
    <View
      className="flex-row items-center gap-1.5 px-3 py-1 rounded-pill self-center"
      style={{
        backgroundColor: bgColor ?? `${color}14`,
        borderWidth: borderColor ? 1 : 0,
        borderColor: borderColor ?? "transparent",
      }}
    >
      <Animated.View
        className="w-2 h-2 rounded-full"
        style={[{ backgroundColor: color }, animatedStyle]}
      />
      <Text className="font-sora-semibold text-xs" style={{ color }}>
        {text}
      </Text>
    </View>
  );
}
