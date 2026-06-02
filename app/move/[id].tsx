import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMove } from '@/hooks/useMove';
import { saveMove } from '@/storage/moves';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { PracticeCounter } from '@/components/PracticeCounter';
import { C, RADIUS } from '@/constants/theme';

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
});
