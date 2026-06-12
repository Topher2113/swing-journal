import { useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SwipeActions } from './SwipeActions';
import { LineDance } from '@/types/LineDance';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  lineDance: LineDance;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function LineDanceCard({ lineDance, onPress, onEdit, onDelete }: Props) {
  const swipeableRef = useRef<any>(null);

  const handleEdit = useCallback(() => {
    swipeableRef.current?.close();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Line Dance',
      `Delete "${lineDance.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  }, [lineDance.name, onDelete]);

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
        <View style={[styles.dot, { backgroundColor: lineDance.videoUri ? C.accent : C.border }]} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{lineDance.name}</Text>
          <View style={styles.meta}>
            <DifficultyBadge difficulty={lineDance.difficulty} />
            <Text style={styles.metaText}>{lineDance.steps.length} steps</Text>
            <Text style={styles.metaText}>↻ {lineDance.practiceCount}</Text>
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
  metaText: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
