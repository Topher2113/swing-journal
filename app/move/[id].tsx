import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMove } from '@/hooks/useMove';
import { saveMove } from '@/storage/moves';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { PracticeCounter } from '@/components/PracticeCounter';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { move, setMove } = useMove(id);

  const handleIncrement = async () => {
    if (!move) return;
    const updated = { ...move, practiceCount: move.practiceCount + 1 };
    await saveMove(updated);
    setMove(updated);
  };

  return (
    <>
      <Stack.Screen options={{ title: move?.name ?? '…' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {move?.videoUri && <VideoPlayer uri={move.videoUri} />}

        {move && (
          <>
            <Text style={styles.name}>{move.name}</Text>

            <View style={styles.badges}>
              <Text style={styles.categoryBadge}>{move.category}</Text>
              <DifficultyBadge difficulty={move.difficulty} />
            </View>

            {move.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{move.notes}</Text>
              </View>
            ) : null}

            <PracticeCounter count={move.practiceCount} onIncrement={handleIncrement} />

            {MOTION_TRACKING_ENABLED && move.motionData && move.motionData.length >= 2 && (
              <Pressable
                style={({ pressed }) => [styles.motionBtn, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'transparent' }}
                onPress={() => router.push({ pathname: '/motion-trail/[id]', params: { id } })}
              >
                <Ionicons name="analytics-outline" size={20} color={C.accent} />
                <Text style={styles.motionBtnText}>View Motion Trail</Text>
                <Ionicons name="chevron-forward" size={16} color={C.textSecondary} style={styles.motionChevron} />
              </Pressable>
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
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: C.accent,
    backgroundColor: C.accentDark + '33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.badge,
    overflow: 'hidden',
  },
  notesBox: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 22,
  },
  motionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    minHeight: 56,
  },
  motionBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  motionChevron: {
    marginLeft: 'auto' as any,
  },
});
