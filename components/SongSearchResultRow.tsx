import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SpotifyTrackResult } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  track: SpotifyTrackResult;
  onPress: () => void;
};

export function SongSearchResultRow({ track, onPress }: Props) {
  const artUrl = track.album.images[0]?.url ?? null;
  const artistNames = track.artists.map((a) => a.name).join(', ');

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
    >
      {artUrl ? (
        <Image source={{ uri: artUrl }} style={styles.art} contentFit="cover" />
      ) : (
        <View style={[styles.art, styles.artPlaceholder]}>
          <Ionicons name="musical-note" size={20} color={C.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artistNames}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    marginBottom: 6,
    minHeight: 68,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 6,
    flexShrink: 0,
  },
  artPlaceholder: {
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  artist: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
