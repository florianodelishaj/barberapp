import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function Card({ children, style, className = '' }: CardProps) {
  return (
    <View
      className={`bg-surface rounded-card ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
