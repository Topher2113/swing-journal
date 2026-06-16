import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useMove } from '@/hooks/useMove';
import { saveMove } from '@/storage/moves';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
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
  const { link } = usePartnerLink();
  const { upsertLocal: shareToJournal } = usePartnerJournal(link?.id ?? '');
  const { user } = useAuth();
  const [shared, setShared] = useState(false);

  const handleIncrement = async () => {
    if (!move) return;
    const updated = { ...move, practiceCount: move.practiceCount + 1 };
    await saveMove(updated);
    setMove(updated);
  };

  const handleShare = async () => {
    if (!move || !link || !user) return;
    const sharedMove: SharedMove = {
      ...move,
      id: Crypto.randomUUID(),
      partnerLinkId: link.id,
      addedByUserId: user.id,
    };
    await shareToJournal(sharedMove);
    setShared(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: move?.name ?? '…',
          headerRight: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/edit/[id]', params: { id } })}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 8 })}
            >
              <Ionicons name="pencil-outline" size={20} color={C.textPrimary} />
            </Pressable>
          ),
        }}
      />
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

            {link?.status === 'linked' && (
              <Pressable
                style={({ pressed }) => [styles.shareBtn, shared && styles.shareBtnDone, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'transparent' }}
                onPress={handleShare}
                disabled={shared}
              >
                <Ionicons
                  name={shared ? 'checkmark-circle-outline' : 'share-outline'}
                  size={18}
                  color={shared ? '#86EFAC' : C.accent}
                />
                <Text style={[styles.shareBtnText, shared && styles.shareBtnTextDone]}>
                  {shared ? 'Shared to journal' : 'Share to partner journal'}
                </Text>
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
  shareBtnDone: {
    borderColor: '#14532D',
    backgroundColor: '#14532D33',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.accent,
  },
  shareBtnTextDone: {
    color: '#86EFAC',
  },
});
