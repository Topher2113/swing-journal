import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorPalette, RADIUS } from './theme';

function createStyles(C: ColorPalette) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: C.bg,
    },
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    content: {
      padding: 20,
      gap: 12,
      paddingBottom: 100,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: C.textPrimary,
      marginTop: 6,
      marginBottom: 2,
    },
    textInput: {
      backgroundColor: C.surface,
      borderRadius: RADIUS.control,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: C.textPrimary,
      minHeight: 50,
    },
    textInputError: {
      borderWidth: 1.5,
      borderColor: C.deleteSwipe,
    },
    fieldError: {
      fontSize: 12,
      color: C.deleteSwipe,
      marginTop: -6,
    },
    multiline: {
      minHeight: 120,
    },
    listCard: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: C.surface,
      borderRadius: RADIUS.card,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 6,
      gap: 12,
      minHeight: 68,
    },
    videoDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      flexShrink: 0,
    },
    cardInfo: {
      flex: 1,
      gap: 6,
    },
    cardName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: C.textPrimary,
    },
    cardMeta: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    metaText: {
      fontSize: 13,
      color: C.textSecondary,
    },
  });
}

export function useCommonStyles() {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}

// Static fallback for non-component contexts (default dark theme)
import { C as defaultColors } from './theme';
export const cs = createStyles(defaultColors);
