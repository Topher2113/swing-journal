import { useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SwipeActions } from './SwipeActions';
import { Move } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  move: Move;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isShared?: boolean;
};

export function MoveCard({ move, onPress, onEdit, onDelete, isShared }: Props) {
  const swipeableRef = useRef<any>(null);

  const handleEdit = useCallback(() => {
    swipeableRef.current?.close();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Move',
      `Delete "${move.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  }, [move.name, onDelete]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => <SwipeActions onEdit={handleEdit} onDelete={handleDelete} />}
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
        <View style={styles.trailingIcons}>
          {isShared && <Ionicons name="link-outline" size={13} color={C.accent} />}
          <Ionicons name="ellipsis-horizontal" size={16} color={C.textSecondary} />
          <Ionicons name="chevron-forward" size={20} color="#636366" />
        </View>
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
  trailingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
