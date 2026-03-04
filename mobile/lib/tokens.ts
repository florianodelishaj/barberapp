// Design tokens — fonte unica di verità per valori non gestibili con Tailwind
export const COLORS = {
  background: '#1C1C1C',
  surface: '#242424',
  accent: '#FA3D3B',
  accentTint: 'rgba(250, 61, 59, 0.08)',
  accentBorder: 'rgba(250, 61, 59, 0.20)',
  textPrimary: '#F0F0F0',
  textSecondary: '#C6C6C6',
  textMuted: '#444444',
  success: '#4CD98A',
  white: '#FFFFFF',
} as const;

export const RADIUS = {
  input: 28,
  card: 16,
  pill: 100,
  icon: 28,
} as const;

export const SPACING = {
  screenPadding: 24,
  contentWidth: 342,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 20,
  xl: 22,
  '2xl': 28,
  '3xl': 48,
} as const;
