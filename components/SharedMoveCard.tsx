import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SharedMove } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  move: SharedMove;
  isOwn: boolean;
  onPress: () => void;
};

export function SharedMoveCard({ move, isOwn, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
    >
      <View style={[styles.dot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{move.name}</Text>
          <View style={[styles.pill, isOwn ? styles.pillOwn : styles.pillPartner]}>
            <Text style={[styles.pillText, isOwn ? styles.pillTextOwn : styles.pillTextPartner]}>
              {isOwn ? 'You' : 'Partner'}
            </Text>
          </View>
        </View>
        <View style={styles.meta}>
          <DifficultyBadge difficulty={move.difficulty} />
          <Text style={styles.practice}>↻ {move.practiceCount}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#636366" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 12,
    minHeight: 68,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  practice: {
    fontSize: 13,
    color: C.textSecondary,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  pillOwn: {
    backgroundColor: C.accent + '33',
  },
  pillPartner: {
    backgroundColor: C.border,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextOwn: {
    color: C.accent,
  },
  pillTextPartner: {
    color: C.textSecondary,
  },
});
