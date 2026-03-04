import { View, Text } from 'react-native';
import { COLORS } from '@/lib/tokens';

type BadgeVariant = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const CONFIG: Record<BadgeVariant, { label: string; color: string }> = {
  pending: { label: 'In attesa di approvazione', color: COLORS.accent },
  confirmed: { label: 'Confermato', color: COLORS.success },
  cancelled: { label: 'Cancellato', color: COLORS.textSecondary },
  completed: { label: 'Completato', color: COLORS.textSecondary },
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function Badge({ variant, label }: BadgeProps) {
  const { label: defaultLabel, color } = CONFIG[variant];
  const text = label ?? defaultLabel;

  return (
    <View
      className="flex-row items-center gap-1.5 px-3 py-1 rounded-pill self-start"
      style={{ backgroundColor: `${color}14` }}
    >
      <View
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text
        className="font-sora-semibold text-xs"
        style={{ color }}
      >
        {text}
      </Text>
    </View>
  );
}
