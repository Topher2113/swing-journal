import { useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SwipeActions } from './SwipeActions';
import { Song } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  song: Song;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function SongCard({ song, onPress, onEdit, onDelete }: Props) {
  const swipeableRef = useRef<any>(null);

  const handleEdit = useCallback(() => {
    swipeableRef.current?.close();
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Song',
      `Delete "${song.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  }, [song.title, onDelete]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={() => <SwipeActions onEdit={handleEdit} onDelete={handleDelete} />}
      overshootRight={false}
    >
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onPress}
      >
        {song.albumArtUrl ? (
          <Image source={{ uri: song.albumArtUrl }} style={styles.art} />
        ) : (
          <View style={[styles.art, styles.artPlaceholder]}>
            <Ionicons name="musical-note" size={18} color={C.textSecondary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        </View>
        <View style={styles.trailingIcons}>
          {song.spotifyUrl && <MaterialCommunityIcons name="spotify" size={18} color="#1DB954" />}
          <Ionicons name="chevron-forward" size={20} color="#636366" />
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 12,
    minHeight: 68,
  },
  art: {
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
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  artist: {
    fontSize: 13,
    color: C.textSecondary,
  },
  trailingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
