import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { C, RADIUS } from '@/constants/theme';
import { Move } from '@/types/Move';

function greeting(name: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = days[new Date().getDay()];
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}!`;
  if (h < 17) return `Happy ${d}, ${name}!`;
  return `Good evening, ${name}!`;
}

function MoveRow({ move, onPress }: { move: Move; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
    >
      <View style={[styles.dot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{move.name}</Text>
        <View style={styles.rowMeta}>
          <DifficultyBadge difficulty={move.difficulty} />
          <Text style={styles.rowPractice}>↻ {move.practiceCount}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { moves, reload: reloadMoves } = useMoves();
  const { link } = usePartnerLink();
  const { items: journalItems, sync } = usePartnerJournal(link?.id ?? '');

  useFocusEffect(
    useCallback(() => {
      reloadMoves();
      if (link?.id) sync();
    }, [reloadMoves, link?.id, sync])
  );

  const recentMoves = useMemo(
    () =>
      [...moves]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [moves]
  );

  const practiceMoves = useMemo(
    () =>
      [...moves]
        .filter((m) => m.practiceCount > 0)
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        .slice(0, 3),
    [moves]
  );

  const partnerMoves = useMemo(() => {
    if (link?.status !== 'linked') return [];
    return [...journalItems]
      .filter((m) => m.addedByUserId !== user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [journalItems, link, user?.id]);

  const name = profile?.name?.split(' ')[0] ?? 'Dancer';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>{greeting(name)}</Text>

        {/* Recent Moves */}
        <SectionHeader title="Recent Moves" onSeeAll={() => router.push('/(tabs)/(library)' as never)} />
        {recentMoves.length === 0 ? (
          <Text style={styles.empty}>No moves yet — add one from the Add tab!</Text>
        ) : (
          recentMoves.map((move) => (
            <MoveRow
              key={move.id}
              move={move}
              onPress={() => router.push({ pathname: '/move/[id]', params: { id: move.id } })}
            />
          ))
        )}

        {/* Practice These */}
        {practiceMoves.length > 0 && (
          <>
            <SectionHeader title="Practice These" onSeeAll={() => router.push('/(tabs)/(library)' as never)} />
            {practiceMoves.map((move) => (
              <MoveRow
                key={move.id}
                move={move}
                onPress={() => router.push({ pathname: '/move/[id]', params: { id: move.id } })}
              />
            ))}
          </>
        )}

        {/* Partner's Latest */}
        {link?.status === 'linked' && (
          <>
            <SectionHeader title="Partner's Latest" onSeeAll={() => router.push('/(tabs)/journal' as never)} />
            {partnerMoves.length === 0 ? (
              <Text style={styles.empty}>Your partner hasn't shared any moves yet.</Text>
            ) : (
              partnerMoves.map((move) => (
                <Pressable
                  key={move.id}
                  style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() =>
                    router.push({ pathname: '/shared-move/[id]', params: { id: move.id } })
                  }
                >
                  <View style={[styles.dot, { backgroundColor: move.videoUri ? C.accent : C.border }]} />
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName} numberOfLines={1}>{move.name}</Text>
                    <View style={styles.rowMeta}>
                      <DifficultyBadge difficulty={move.difficulty} />
                      <Text style={styles.rowPractice}>↻ {move.practiceCount}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
                </Pressable>
              ))
            )}
          </>
        )}
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
    padding: 20,
    gap: 12,
    paddingBottom: 48,
    paddingTop: 100,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    color: C.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 64,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    gap: 6,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowPractice: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
