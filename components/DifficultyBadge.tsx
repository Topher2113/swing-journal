import { StyleSheet, Text } from 'react-native';
import { Difficulty } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

const palette: Record<Difficulty, { bg: string; text: string }> = {
  Beginner: C.beginner,
  Intermediate: C.intermediate,
  Advanced: C.advanced,
};

type Props = { difficulty: Difficulty };

export function DifficultyBadge({ difficulty }: Props) {
  const colors = palette[difficulty];
  return (
    <Text style={[styles.badge, { backgroundColor: colors.bg, color: colors.text }]}>
      {difficulty}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.badge,
    overflow: 'hidden',
  },
});
