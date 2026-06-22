import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const SAVED_FROM_JOURNAL_KEY = '@saved-shared-moves';

export default function SharedMoveDetailScreen() {
  const { id, partnerLinkId } = useLocalSearchParams<{ id: string; partnerLinkId: string }>();
  const router = useRouter();
  const { link } = usePartnerLink();
  const resolvedLinkId = partnerLinkId ?? link?.id ?? '';
  const { items, upsertLocal, removeLocal } = usePartnerJournal(resolvedLinkId);
  const { user } = useAuth();

  const { moves, addMove } = useMoves();
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(SAVED_FROM_JOURNAL_KEY).then((json) => {
      if (!json) return;
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        const migrated: Record<string, string> = {};
        for (const id of parsed) migrated[id] = '';
        setSavedMap(migrated);
      } else {
        setSavedMap(parsed);
      }
    });
  }, []);

  const move = useMemo(() => items.find((m) => m.id === id) ?? null, [items, id]);
  const libraryMoveId = savedMap[move?.id ?? ''];
  const isSaved = libraryMoveId !== undefined && (libraryMoveId === '' || moves.some((m) => m.id === libraryMoveId));

  const handleIncrement = async () => {
    if (!move) return;
    await upsertLocal({ ...move, practiceCount: move.practiceCount + 1 });
  };

  const handleSaveToLibrary = async () => {
    if (!move || isSaved) return;
    const created = await addMove({
      name: move.name,
      category: move.category,
      difficulty: move.difficulty,
      notes: move.notes,
      videoUri: move.videoUri,
      motionData: move.motionData,
    });
    const next = { ...savedMap, [move.id]: created.id };
    setSavedMap(next);
    await AsyncStorage.setItem(SAVED_FROM_JOURNAL_KEY, JSON.stringify(next));
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

        {!isOwn && (
          <Pressable
            style={({ pressed }) => [styles.saveBtn, isSaved && styles.saveBtnDone, { opacity: pressed ? 0.8 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={handleSaveToLibrary}
            disabled={isSaved}
          >
            <Ionicons
              name={isSaved ? 'checkmark-circle-outline' : 'bookmark-outline'}
              size={18}
              color={isSaved ? '#86EFAC' : C.accent}
            />
            <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextDone]}>
              {isSaved ? 'Saved to your library' : 'Save to my library'}
            </Text>
          </Pressable>
        )}

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
