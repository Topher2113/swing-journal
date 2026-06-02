import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useMoves } from '@/hooks/useMoves';
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
  const { moves, reload } = useMoves();
  const { totalMoves, totalPractices, byCategory, byDifficulty, maxCategoryCount } =
    useStats(moves);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.metricRow}>
        <StatCard value={totalMoves} label="Total moves" />
        <StatCard value={totalPractices} label="Total practices" />
      </View>

      <Text style={styles.sectionTitle}>By Category</Text>
      <View style={styles.card}>
        {byCategory.map(({ category, count }) => (
          <View key={category} style={styles.catItem}>
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
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>By Difficulty</Text>
      <View style={styles.card}>
        {byDifficulty.map(({ difficulty, count }) => (
          <View key={difficulty} style={styles.diffRow}>
            <View style={styles.diffLeft}>
              <View
                style={[
                  styles.diffDot,
                  { backgroundColor: DIFFICULTY_COLORS[difficulty] },
                ]}
              />
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: -8,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    gap: 10,
  },
  catItem: {
    gap: 4,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 13,
    color: C.textPrimary,
  },
  catCount: {
    fontSize: 12,
    color: C.textSecondary,
  },
  barBg: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  diffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
