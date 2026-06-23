import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Difficulty } from '@/types/Move';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = { difficulty: Difficulty };

export function DifficultyBadge({ difficulty }: Props) {
  const { colors: C } = useTheme();

  const palette: Record<Difficulty, { bg: string; text: string }> = {
    Beginner: C.beginner,
    Intermediate: C.intermediate,
    Advanced: C.advanced,
  };

  const styles = useMemo(() => StyleSheet.create({
    badge: {
      fontSize: 10,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.badge,
      overflow: 'hidden',
    },
  }), [C]);

  const colors = palette[difficulty];
  return (
    <Text style={[styles.badge, { backgroundColor: colors.bg, color: colors.text }]}>
      {difficulty}
    </Text>
  );
}
