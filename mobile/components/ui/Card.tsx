import {
  GRADIENT_COLORS,
  GRADIENT_START,
  GRADIENT_END,
  SIDE_GRADIENT_STYLE,
} from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { View, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function Card({ children, style, className = "" }: CardProps) {
  return (
    <View
      className={`bg-surface rounded-card px-6 py-4 ${className}`}
      style={style}
    >
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={SIDE_GRADIENT_STYLE}
      />
      {children}
    </View>
  );
}
