import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLineDance } from '@/hooks/useLineDance';
import { useSongs } from '@/hooks/useSongs';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { StepListView } from '@/components/StepListView';
import { PracticeCounter } from '@/components/PracticeCounter';
import { NotesBox } from '@/components/NotesBox';
import { C, RADIUS } from '@/constants/theme';

export default function LineDanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lineDance, incrementPractice } = useLineDance(id);
  const { songs } = useSongs();

  const linkedSong = lineDance?.linkedSongId
    ? (songs.find((s) => s.id === lineDance.linkedSongId) ?? null)
    : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: lineDance?.name ?? '…',
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/edit-line-dance/${id}` as any)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 8 })}
            >
              <Ionicons name="pencil-outline" size={20} color={C.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {lineDance && (
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
                  {linkedSong.albumArtUrl ? (
                    <Image source={{ uri: linkedSong.albumArtUrl }} style={styles.linkedArt} contentFit="cover" />
                  ) : (
                    <View style={[styles.linkedArt, styles.artPlaceholder]}>
                      <Ionicons name="musical-note" size={18} color={C.textSecondary} />
                    </View>
                  )}
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
  linkedArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
  },
  artPlaceholder: {
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
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
});
