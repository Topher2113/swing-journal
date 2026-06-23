import { useCallback, useMemo, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { SwipeActions } from './SwipeActions';
import { Move } from '@/types/Move';
import { useTheme } from '@/context/ThemeContext';
import { useCommonStyles } from '@/constants/commonStyles';

type Props = {
  move: Move;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isShared?: boolean;
};

export function MoveCard({ move, onPress, onEdit, onDelete, isShared }: Props) {
  const { colors: C } = useTheme();
  const cs = useCommonStyles();
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

  const styles = useMemo(() => StyleSheet.create({
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    trailingIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  }), [C]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => <SwipeActions onEdit={handleEdit} onDelete={handleDelete} />}
      overshootRight={false}
    >
      <Pressable
        style={({ pressed }) => [cs.listCard, { opacity: pressed ? 0.85 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPress}
      >
        <View style={[cs.videoDot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
        <View style={cs.cardInfo}>
          <View style={styles.nameRow}>
            {isShared && <Ionicons name="link-outline" size={13} color={C.accent} />}
            <Text style={cs.cardName} numberOfLines={1}>{move.name}</Text>
          </View>
          <View style={cs.cardMeta}>
            <DifficultyBadge difficulty={move.difficulty} />
            <Text style={cs.metaText}>↻ {move.practiceCount}</Text>
          </View>
        </View>
        <View style={styles.trailingIcons}>
          <Ionicons name="ellipsis-horizontal" size={16} color={C.textSecondary} />
          <Ionicons name="chevron-forward" size={20} color={C.chevron} />
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}
