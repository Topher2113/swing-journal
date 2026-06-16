import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { NotesBox } from '@/components/NotesBox';
import { PracticeCounter } from '@/components/PracticeCounter';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function SharedMoveDetailScreen() {
  const { id, partnerLinkId } = useLocalSearchParams<{ id: string; partnerLinkId: string }>();
  const { link } = usePartnerLink();
  const resolvedLinkId = partnerLinkId ?? link?.id ?? '';
  const { items, upsertLocal } = usePartnerJournal(resolvedLinkId);
  const { user } = useAuth();

  const move = useMemo(() => items.find((m) => m.id === id) ?? null, [items, id]);

  const handleIncrement = async () => {
    if (!move) return;
    await upsertLocal({ ...move, practiceCount: move.practiceCount + 1 });
  };

  const addedByLabel =
    move?.addedByUserId === user?.id
      ? 'Added by you'
      : 'Added by partner';

  if (!move) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={C.textSecondary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: move.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {move.videoUri && <VideoPlayer uri={move.videoUri} />}

        <Text style={styles.name}>{move.name}</Text>

        <View style={styles.badges}>
          <Text style={styles.categoryBadge}>{move.category}</Text>
          <DifficultyBadge difficulty={move.difficulty} />
        </View>

        <Text style={styles.addedBy}>{addedByLabel}</Text>

        {move.notes ? <NotesBox notes={move.notes} /> : null}

        <PracticeCounter count={move.practiceCount} onIncrement={handleIncrement} />

        {MOTION_TRACKING_ENABLED && move.motionData && move.motionData.length >= 2 && (
          <View style={styles.motionNote}>
            <Text style={styles.motionNoteText}>Motion data available (recorded on original device)</Text>
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
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
  addedBy: {
    fontSize: 13,
    color: C.textSecondary,
    fontStyle: 'italic',
  },
  motionNote: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 12,
  },
  motionNoteText: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
