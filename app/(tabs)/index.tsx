import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { CategorySection } from '@/components/CategorySection';
import { CATEGORIES } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

function MovesHeader({ count }: { count: number }) {
  return (
    <View style={styles.headerTitle}>
      <Text style={styles.title}>My Moves</Text>
      <Text style={styles.subtitle}>{count} move{count !== 1 ? 's' : ''} logged</Text>
    </View>
  );
}

export default function MovesScreen() {
  const router = useRouter();
  const { moves, reload, deleteMove } = useMoves();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const byCategory = useMemo(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat, moves.filter((m) => m.category === cat)])),
    [moves]
  );

  if (moves.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: () => <MovesHeader count={0} /> }} />
        <View style={styles.fullEmpty}>
          <Ionicons name="musical-notes-outline" size={64} color={C.textSecondary} />
          <Text style={styles.emptyTitle}>No moves yet</Text>
          <Text style={styles.emptyBody}>Start logging your swing dance moves.</Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.8 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => router.push('/(tabs)/add')}
          >
            <Text style={styles.emptyBtnText}>Add your first move</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <MovesHeader count={moves.length} />,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            moves={byCategory[cat]}
            onPressHeader={() =>
              router.push({
                pathname: '/category/[category]',
                params: { category: cat },
              })
            }
            onPressMove={(id) =>
              router.push({ pathname: '/move/[id]', params: { id } })
            }
            onEditMove={(id) =>
              router.push({ pathname: '/edit/[id]', params: { id } })
            }
            onDeleteMove={deleteMove}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },
  fullEmpty: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textPrimary,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
});
