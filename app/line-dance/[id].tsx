import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLineDance } from '@/hooks/useLineDance';
import { useSongs } from '@/hooks/useSongs';
import { Skeleton, SkeletonRow } from '@/components/Skeleton';
import { AlbumArt } from '@/components/AlbumArt';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { StepListView } from '@/components/StepListView';
import { PracticeCounter } from '@/components/PracticeCounter';
import { NotesBox } from '@/components/NotesBox';
import { C, RADIUS } from '@/constants/theme';

export default function LineDanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lineDance, incrementPractice, loading } = useLineDance(id);
  const { songs } = useSongs();

  const linkedSong = lineDance?.linkedSongId
    ? (songs.find((s) => s.id === lineDance.linkedSongId) ?? null)
    : null;

  const headerRight = useCallback(() => (
    <Pressable
      onPress={() => router.push(`/edit-line-dance/${id}` as any)}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 8 })}
    >
      <Ionicons name="pencil-outline" size={20} color={C.textPrimary} />
    </Pressable>
  ), [router, id]);

  return (
    <>
      <Stack.Screen options={{ title: lineDance?.name ?? '…', headerRight }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <>
            <Skeleton height={28} width="85%" />
            <SkeletonRow>
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={60} />
            </SkeletonRow>
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={72} />
          </>
        ) : !lineDance ? (
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Line dance not found.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{lineDance.name}</Text>

            <View style={styles.badges}>
              <DifficultyBadge difficulty={lineDance.difficulty} />
              <Text style={styles.stepCount}>{lineDance.steps.length} steps</Text>
            </View>

            {lineDance.videoUri && <VideoPlayer uri={lineDance.videoUri} />}

            {linkedSong && (
              <>
                <Text style={styles.sectionLabel}>Linked Song</Text>
                <Pressable
                  style={({ pressed }) => [styles.linkedSongRow, { opacity: pressed ? 0.8 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => router.push(`/song/${linkedSong.id}` as any)}
                >
                  <AlbumArt url={linkedSong.albumArtUrl} size={40} />
                  <View style={styles.linkedInfo}>
                    <Text style={styles.linkedTitle} numberOfLines={1}>{linkedSong.title}</Text>
                    <Text style={styles.linkedArtist} numberOfLines={1}>{linkedSong.artist}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
                </Pressable>
              </>
            )}

            {lineDance.notes ? <NotesBox notes={lineDance.notes} /> : null}

            {lineDance.steps.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Steps</Text>
                <StepListView steps={lineDance.steps} />
              </>
            )}

            <PracticeCounter count={lineDance.practiceCount} onIncrement={incrementPractice} />
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
  stepCount: {
    fontSize: 13,
    color: C.textSecondary,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    marginBottom: -4,
  },
  linkedSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 12,
    gap: 12,
  },
  linkedInfo: {
    flex: 1,
    gap: 3,
  },
  linkedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  linkedArtist: {
    fontSize: 13,
    color: C.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  notFoundText: {
    fontSize: 16,
    color: C.textSecondary,
  },
});
