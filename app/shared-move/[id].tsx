import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { useMoves } from '@/hooks/useMoves';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { NotesBox } from '@/components/NotesBox';
import { PracticeCounter } from '@/components/PracticeCounter';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function SharedMoveDetailScreen() {
  const { id, partnerLinkId } = useLocalSearchParams<{ id: string; partnerLinkId: string }>();
  const router = useRouter();
  const { link } = usePartnerLink();
  const resolvedLinkId = partnerLinkId ?? link?.id ?? '';
  const { items, upsertLocal, removeLocal } = usePartnerJournal(resolvedLinkId);
  const { user } = useAuth();

  const { addMove } = useMoves();
  const [saved, setSaved] = useState(false);

  const move = useMemo(() => items.find((m) => m.id === id) ?? null, [items, id]);

  const handleIncrement = async () => {
    if (!move) return;
    await upsertLocal({ ...move, practiceCount: move.practiceCount + 1 });
  };

  const handleSaveToLibrary = async () => {
    if (!move || saved) return;
    await addMove({
      name: move.name,
      category: move.category,
      difficulty: move.difficulty,
      notes: move.notes,
      videoUri: move.videoUri,
      motionData: move.motionData,
    });
    setSaved(true);
  };

  const isOwn = move?.addedByUserId === user?.id;
  const addedByLabel = isOwn ? 'Added by you' : 'Added by partner';

  const handleRemove = () => {
    if (!move) return;
    Alert.alert('Remove from journal', 'Remove this move from the partner journal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeLocal(move.id);
          router.back();
        },
      },
    ]);
  };

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

        <Pressable
          style={({ pressed }) => [styles.saveBtn, saved && styles.saveBtnDone, { opacity: pressed ? 0.8 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={handleSaveToLibrary}
          disabled={saved}
        >
          <Ionicons
            name={saved ? 'checkmark-circle-outline' : 'bookmark-outline'}
            size={18}
            color={saved ? '#86EFAC' : C.accent}
          />
          <Text style={[styles.saveBtnText, saved && styles.saveBtnTextDone]}>
            {saved ? 'Saved to your library' : 'Save to my library'}
          </Text>
        </Pressable>

        {isOwn && (
          <Pressable
            style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.8 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={handleRemove}
          >
            <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
            <Text style={styles.removeBtnText}>Remove from journal</Text>
          </Pressable>
        )}

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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.border,
  },
  saveBtnDone: {
    borderColor: '#14532D',
    backgroundColor: '#14532D33',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.accent,
  },
  saveBtnTextDone: {
    color: '#86EFAC',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#7F1D1D44',
  },
  removeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FCA5A5',
  },
});
