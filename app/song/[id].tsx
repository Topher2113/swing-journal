import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSong } from '@/hooks/useSong';
import { NotesBox } from '@/components/NotesBox';
import { SpotifyLinkButton } from '@/components/SpotifyLinkButton';
import { C, RADIUS } from '@/constants/theme';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { song } = useSong(id);

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
        {song && (
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
});
