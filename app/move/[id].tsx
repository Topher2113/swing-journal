import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMove } from '@/hooks/useMove';
import { useMoves } from '@/hooks/useMoves';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, isLocalUri } from '@/lib/videoStorage';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { NotesBox } from '@/components/NotesBox';
import { PracticeCounter } from '@/components/PracticeCounter';
import { SharedMove } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { move, setMove } = useMove(id);
  const { updateMove } = useMoves();
  const { link, loading: linkLoading } = usePartnerLink();
  const { items: journalItems, loading: journalLoading, upsertLocal: shareToJournal, sync: syncJournal, reload: reloadJournal } = usePartnerJournal(link?.id ?? '');
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [savedFromJournal, setSavedFromJournal] = useState(false);

  // Reload from AsyncStorage immediately, then sync from Supabase in background.
  // This ensures isShared is correct even after sharing from another session or device.
  useFocusEffect(
    useCallback(() => {
      reloadJournal();
      if (link?.id) syncJournal();
    }, [reloadJournal, link?.id, syncJournal])
  );

  useEffect(() => {
    if (!id) return;
    AsyncStorage.getItem('@saved-shared-moves').then((json) => {
      if (!json) return;
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) return;
      setSavedFromJournal(Object.values(parsed).includes(id));
    });
  }, [id]);

  const existingSharedMove = useMemo(
    () => journalItems.find((m) => m.originalMoveId === move?.id && m.addedByUserId === user?.id),
    [journalItems, move?.id, user?.id]
  );
  const isShared = !!existingSharedMove;

  const handleIncrement = async () => {
    if (!move) return;
    const updated = { ...move, practiceCount: move.practiceCount + 1 };
    await updateMove(updated);
    setMove(updated);
  };

  const handleShare = async () => {
    if (!move || !link || !user || sharing) return;
    setSharing(true);
    try {
      let shareVideoUri = move.videoUri;
      if (shareVideoUri && isLocalUri(shareVideoUri)) {
        shareVideoUri = await uploadVideo(shareVideoUri, user.id);
      }
      const sharedMove: SharedMove = {
        ...move,
        id: existingSharedMove?.id ?? Crypto.randomUUID(),
        videoUri: shareVideoUri,
        partnerLinkId: link.id,
        addedByUserId: user.id,
        originalMoveId: move.id,
      };
      await shareToJournal(sharedMove);
      syncJournal();
    } finally {
      setSharing(false);
    }
  };

  const headerRight = useCallback(() => (
    <Pressable
      onPress={() => router.push({ pathname: '/edit/[id]', params: { id } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 8 })}
    >
      <Ionicons name="pencil-outline" size={20} color={C.textPrimary} />
    </Pressable>
  ), [router, id]);

  return (
    <>
      <Stack.Screen options={{ title: move?.name ?? '…', headerRight }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {move?.videoUri && <VideoPlayer uri={move.videoUri} />}

        {move && (
          <>
            <Text style={styles.name}>{move.name}</Text>

            <View style={styles.badges}>
              <Text style={styles.categoryBadge}>{move.category}</Text>
              <DifficultyBadge difficulty={move.difficulty} />
            </View>

            {move.notes ? <NotesBox notes={move.notes} /> : null}

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

            {!linkLoading && !journalLoading && link?.status === 'linked' && !savedFromJournal && (
              isShared ? (
                <View style={styles.sharedBadge}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#86EFAC" />
                  <Text style={styles.sharedBadgeText}>Shared to journal</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.shareBtn, { opacity: pressed && !sharing ? 0.8 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={handleShare}
                  disabled={sharing}
                >
                  {sharing ? (
                    <>
                      <ActivityIndicator size="small" color={C.accent} />
                      <Text style={styles.shareBtnText}>
                        {move?.videoUri ? 'Uploading video…' : 'Sharing…'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="share-outline" size={18} color={C.accent} />
                      <Text style={styles.shareBtnText}>Share to partner journal</Text>
                    </>
                  )}
                </Pressable>
              )
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
  shareBtn: {
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
  shareBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.accent,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.successBg + '33',
    borderRadius: RADIUS.card,
    padding: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.successBg,
  },
  sharedBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.success,
  },
});
