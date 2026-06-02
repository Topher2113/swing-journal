import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MoveCard } from './MoveCard';
import { EmptyState } from './EmptyState';
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
  const sorted = [...moves].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const preview = sorted.slice(0, PREVIEW_COUNT);
  const remaining = moves.length - PREVIEW_COUNT;

  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPressHeader}
      >
        <Text style={styles.categoryName}>{category}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{moves.length}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.accent} />
        </View>
      </Pressable>

      {moves.length === 0 ? (
        <EmptyState message={`No ${category.toLowerCase()} moves yet`} />
      ) : (
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
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 10,
    minHeight: 44,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
    color: C.accent,
  },
  moreRow: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 12,
    color: C.accent,
    opacity: 0.8,
  },
});
