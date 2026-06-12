import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSong } from '@/hooks/useSong';
import { Skeleton } from '@/components/Skeleton';
import { NotesBox } from '@/components/NotesBox';
import { SpotifyLinkButton } from '@/components/SpotifyLinkButton';
import { Image } from 'expo-image';
import { C, RADIUS } from '@/constants/theme';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { song, loading } = useSong(id);

  return (
    <>
      <Stack.Screen
        options={{
          title: song?.title ?? '…',
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/edit-song/${id}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 8 })}
            >
              <Ionicons name="pencil-outline" size={20} color={C.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {loading ? (
          <>
            <Skeleton style={{ aspectRatio: 1 }} borderRadius={RADIUS.card} />
            <Skeleton height={28} width="90%" />
            <Skeleton height={18} width="60%" />
            <Skeleton height={44} />
          </>
        ) : !song ? (
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Song not found.</Text>
          </View>
        ) : (
          <>
            {song.albumArtUrl ? (
              <Image source={{ uri: song.albumArtUrl }} style={styles.art} contentFit="cover" />
            ) : (
              <View style={[styles.art, styles.artPlaceholder]}>
                <Ionicons name="musical-notes" size={48} color={C.textSecondary} />
              </View>
            )}

            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.artist}</Text>

            {song.spotifyUrl && <SpotifyLinkButton url={song.spotifyUrl} />}

            {song.notes ? <NotesBox notes={song.notes} /> : null}
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
  art: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: RADIUS.card,
  },
  artPlaceholder: {
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textPrimary,
  },
  artist: {
    fontSize: 17,
    color: C.textSecondary,
    marginTop: -8,
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
