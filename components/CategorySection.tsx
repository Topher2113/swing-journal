import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoveCard } from './MoveCard';
import { Move, Category } from '@/types/Move';
import { C } from '@/constants/theme';

type Props = {
  category: Category;
  moves: Move[];
  onPressHeader: () => void;
  onPressMove: (id: string) => void;
  onEditMove: (id: string) => void;
  onDeleteMove: (id: string) => void;
};

const PREVIEW_COUNT = 3;

export function CategorySection({
  category,
  moves,
  onPressHeader,
  onPressMove,
  onEditMove,
  onDeleteMove,
}: Props) {
  const isEmpty = moves.length === 0;
  const sorted = useMemo(
    () => [...moves].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [moves]
  );
  const preview = sorted.slice(0, PREVIEW_COUNT);
  const remaining = moves.length - PREVIEW_COUNT;

  return (
    <View style={styles.section}>
      {isEmpty ? (
        <View style={[styles.header, styles.headerDisabled]}>
          <Text style={[styles.categoryName, styles.categoryNameDisabled]}>{category}</Text>
          <Text style={styles.countDisabled}>0</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={onPressHeader}
        >
          <Text style={styles.categoryName}>{category}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.count}>{moves.length}</Text>
            <Ionicons name="chevron-forward" size={18} color={C.accent} />
          </View>
        </Pressable>
      )}

      {!isEmpty && (
        <>
          {preview.map((move) => (
            <MoveCard
              key={move.id}
              move={move}
              onPress={() => onPressMove(move.id)}
              onEdit={() => onEditMove(move.id)}
              onDelete={() => onDeleteMove(move.id)}
            />
          ))}
          {remaining > 0 && (
            <Pressable
              style={({ pressed }) => [styles.moreRow, { opacity: pressed ? 0.7 : 1 }]}
              android_ripple={{ color: 'transparent' }}
              onPress={onPressHeader}
            >
              <Text style={styles.moreText}>+ {remaining} more →</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    minHeight: 52,
  },
  headerDisabled: {
    opacity: 0.35,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textPrimary,
  },
  categoryNameDisabled: {
    color: C.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontSize: 15,
    fontWeight: '600',
    color: C.accent,
  },
  countDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
  },
  moreRow: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 14,
    color: C.accent,
    opacity: 0.8,
  },
});
