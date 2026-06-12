import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { useLineDances } from '@/hooks/useLineDances';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/StatCard';
import { C, RADIUS } from '@/constants/theme';
import type { Difficulty } from '@/types/Move';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: '#22C55E',
  Intermediate: '#F59E0B',
  Advanced: '#EF4444',
};

export default function StatsScreen() {
  const router = useRouter();
  const { moves, reload: reloadMoves } = useMoves();
  const { songs, reload: reloadSongs } = useSongs();
  const { lineDances, reload: reloadLineDances } = useLineDances();

  const {
    totalMoves,
    totalPractices,
    byCategory,
    byDifficulty,
    maxCategoryCount,
    totalLineDances,
    totalLineDancePractices,
    totalSteps,
    totalSongs,
    ldByDifficulty,
  } = useStats(moves, lineDances, songs);

  useFocusEffect(
    useCallback(() => {
      reloadMoves();
      reloadSongs();
      reloadLineDances();
    }, [reloadMoves, reloadSongs, reloadLineDances])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Moves</Text>
      <View style={styles.metricRow}>
        <StatCard value={totalMoves} label="Total moves" />
        <StatCard value={totalPractices} label="Total practices" />
      </View>

      <Text style={styles.sectionTitle}>Line Dances</Text>
      <View style={styles.metricRow}>
        <StatCard value={totalLineDances} label="Line dances" />
        <StatCard value={totalLineDancePractices} label="Practices" />
      </View>
      <View style={styles.metricRow}>
        <StatCard value={totalSteps} label="Steps catalogued" />
        <StatCard value={totalSongs} label="Songs saved" />
      </View>

      <Text style={styles.sectionTitle}>Moves by Category</Text>
      <View style={styles.card}>
        {byCategory.map(({ category, count }) => (
          <Pressable
            key={category}
            style={({ pressed }) => [styles.catItem, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => router.push({ pathname: '/category/[category]', params: { category } })}
          >
            <View style={styles.catRow}>
              <Text style={styles.catName}>{category}</Text>
              <Text style={styles.catCount}>{count} moves</Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(count / maxCategoryCount) * 100}%` },
                ]}
              />
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Moves by Difficulty</Text>
      <View style={styles.card}>
        {byDifficulty.map(({ difficulty, count }) => (
          <View key={difficulty} style={styles.diffRow}>
            <View style={styles.diffLeft}>
              <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLORS[difficulty] }]} />
              <Text style={styles.catName}>{difficulty}</Text>
            </View>
            <Text style={styles.catCount}>{count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Line Dances by Difficulty</Text>
      <View style={styles.card}>
        {ldByDifficulty.map(({ difficulty, count }) => (
          <View key={difficulty} style={styles.diffRow}>
            <View style={styles.diffLeft}>
              <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLORS[difficulty] }]} />
              <Text style={styles.catName}>{difficulty}</Text>
            </View>
            <Text style={styles.catCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: -8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 18,
    gap: 14,
  },
  catItem: {
    gap: 6,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 16,
    color: C.textPrimary,
  },
  catCount: {
    fontSize: 15,
    color: C.textSecondary,
  },
  barBg: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    backgroundColor: C.accent,
    borderRadius: 4,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  diffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  diffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
