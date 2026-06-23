import React, { useCallback, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { useLineDances } from '@/hooks/useLineDances';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { StatCard } from '@/components/StatCard';
import { RADIUS } from '@/constants/theme';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import type { Difficulty } from '@/types/Move';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: '#22C55E',
  Intermediate: '#F59E0B',
  Advanced: '#EF4444',
};

const DANCE_PREF_LABELS = {
  swing: 'Swing',
  line_dancing: 'Line Dancing',
  both: 'Swing & Line Dancing',
};

const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function ProfileScreen() {
  const { colors: C, mode, setMode } = useTheme();
  const router = useRouter();
  const { user, profile } = useAuth();
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

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // onAuthStateChange in AuthContext clears the session and the gate
          // in _layout.tsx redirects to sign-in automatically
        },
      },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    content: {
      padding: 16,
      gap: 16,
      paddingBottom: 48,
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
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 4,
    },
    profileInfo: {
      flex: 1,
      gap: 2,
    },
    profileValue: {
      fontSize: 16,
      color: C.textPrimary,
      fontWeight: '500',
    },
    profileLabel: {
      fontSize: 12,
      color: C.textSecondary,
    },
    divider: {
      height: 0.5,
      backgroundColor: C.border,
      marginHorizontal: -18,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.surface,
      borderRadius: RADIUS.card,
      padding: 16,
      borderWidth: 1,
      borderColor: C.errorBorder,
    },
    logoutBtnPressed: {
      opacity: 0.7,
    },
    logoutText: {
      color: C.error,
      fontSize: 15,
      fontWeight: '600',
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: -8,
    },
  }), [C]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Stats ── */}
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
            onPress={() => router.push({ pathname: '/profile-category/[category]', params: { category } })}
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

      {/* ── Appearance ── */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        {(['Dark', 'Light', 'System'] as const).map((option, i) => (
          <React.Fragment key={option}>
            {i > 0 && <View style={styles.divider} />}
            <Pressable
              style={({ pressed }) => [styles.profileRow, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => setMode(option.toLowerCase() as ThemeMode)}
            >
              <Ionicons
                name={option === 'Dark' ? 'moon-outline' : option === 'Light' ? 'sunny-outline' : 'phone-portrait-outline'}
                size={18}
                color={C.textSecondary}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileValue}>{option}</Text>
              </View>
              {mode === option.toLowerCase() && (
                <Ionicons name="checkmark" size={20} color={C.accent} />
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </View>

      {/* ── Profile ── */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Pressable
          onPress={() => router.push('/edit-profile' as never)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        >
          <Ionicons name="pencil-outline" size={18} color={C.accent} />
        </Pressable>
      </View>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Ionicons name="person-outline" size={18} color={C.textSecondary} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileValue}>{profile?.name ?? '—'}</Text>
            <Text style={styles.profileLabel}>Name</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.profileRow}>
          <Ionicons name="mail-outline" size={18} color={C.textSecondary} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileValue}>{user?.email ?? '—'}</Text>
            <Text style={styles.profileLabel}>Email</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.profileRow}>
          <Ionicons name="musical-notes-outline" size={18} color={C.textSecondary} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileValue}>
              {profile ? DANCE_PREF_LABELS[profile.dancePreference] : '—'}
            </Text>
            <Text style={styles.profileLabel}>Dance style</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.profileRow}>
          <Ionicons name="ribbon-outline" size={18} color={C.textSecondary} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileValue}>
              {profile ? LEVEL_LABELS[profile.level] : '—'}
            </Text>
            <Text style={styles.profileLabel}>Experience level</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={C.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

    </ScrollView>
  );
}
