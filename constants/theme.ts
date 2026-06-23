export type ColorPalette = typeof darkColors;

export const darkColors = {
  bg: '#0F0F0F',
  surface: '#1C1C1E',
  border: '#2C2C2E',
  accent: '#3B82F6',
  accentDark: '#1D4ED8',
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  beginner: { bg: '#14532D', text: '#86EFAC' },
  intermediate: { bg: '#78350F', text: '#FCD34D' },
  advanced: { bg: '#7F1D1D', text: '#FCA5A5' },
  editSwipe: '#3B82F6',
  deleteSwipe: '#EF4444',
  success: '#86EFAC',
  successBg: '#14532D',
  error: '#FCA5A5',
  errorBorder: '#7F1D1D44',
  chevron: '#636366',
};

export const lightColors: ColorPalette = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  border: '#D1D1D6',
  accent: '#3B82F6',
  accentDark: '#2563EB',
  textPrimary: '#1C1C1E',
  textSecondary: '#636366',
  beginner: { bg: '#DCFCE7', text: '#166534' },
  intermediate: { bg: '#FEF3C7', text: '#92400E' },
  advanced: { bg: '#FEE2E2', text: '#991B1B' },
  editSwipe: '#3B82F6',
  deleteSwipe: '#EF4444',
  success: '#166534',
  successBg: '#DCFCE7',
  error: '#991B1B',
  errorBorder: '#FCA5A544',
  chevron: '#AEAEB2',
};

// Default export for static usage — components using useTheme() get dynamic colors
export const C = darkColors;

export const RADIUS = {
  card: 12,
  badge: 20,
  chip: 20,
  control: 10,
};
