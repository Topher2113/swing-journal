import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SharedMove } from '@/types/Move';
import { C } from '@/constants/theme';
import { cs } from '@/constants/commonStyles';

type Props = {
  move: SharedMove;
  isOwn: boolean;
  onPress: () => void;
};

export function SharedMoveCard({ move, isOwn, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [cs.listCard, { opacity: pressed ? 0.85 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
    >
      <View style={[cs.videoDot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
      <View style={cs.cardInfo}>
        <View style={styles.topRow}>
          <Text style={[cs.cardName, { flex: 1 }]} numberOfLines={1}>{move.name}</Text>
          <View style={[styles.pill, isOwn ? styles.pillOwn : styles.pillPartner]}>
            <Text style={[styles.pillText, isOwn ? styles.pillTextOwn : styles.pillTextPartner]}>
              {isOwn ? 'You' : 'Partner'}
            </Text>
          </View>
        </View>
        <View style={cs.cardMeta}>
          <DifficultyBadge difficulty={move.difficulty} />
          <Text style={cs.metaText}>↻ {move.practiceCount}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
