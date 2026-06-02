import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { Move } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  move: Move;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function RightActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.actions}>
      <Pressable
        style={[styles.actionBtn, styles.editBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onEdit}
      >
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.actionBtn, styles.deleteBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onDelete}
      >
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </Pressable>
    </View>
  );
}

export function MoveCard({ move, onPress, onEdit, onDelete }: Props) {
  return (
    <ReanimatedSwipeable
      renderRightActions={() => <RightActions onEdit={onEdit} onDelete={onDelete} />}
      overshootRight={false}
    >
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPress}
      >
        <View style={[styles.dot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{move.name}</Text>
          <View style={styles.meta}>
            <DifficultyBadge difficulty={move.difficulty} />
            <Text style={styles.practice}>↻ {move.practiceCount}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#636366" />
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 16,
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
  name: {
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
  actions: {
    flexDirection: 'row',
    marginBottom: 6,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  actionBtn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editBtn: {
    backgroundColor: C.editSwipe,
  },
  deleteBtn: {
    backgroundColor: C.deleteSwipe,
  },
  actionLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
});
