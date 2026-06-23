import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorPalette } from '@/constants/theme';

export function useThemeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ColorPalette) => T,
): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
