import { useCallback, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Song } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  song: Song;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function RightActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.actions}>
      <Pressable
        style={[styles.actionBtn, styles.editBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onEdit}
      >
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.actionBtn, styles.deleteBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onDelete}
      >
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </Pressable>
    </View>
  );
}

export function SongCard({ song, onPress, onEdit, onDelete }: Props) {
  const swipeableRef = useRef<any>(null);

  // Close the swipeable before navigating so the card is in its resting state
  // when the user returns from the Edit screen.
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
      renderRightActions={() => <RightActions onEdit={handleEdit} onDelete={handleDelete} />}
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
  actions: {
    flexDirection: 'row',
    marginBottom: 6,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  actionBtn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editBtn: {
    backgroundColor: C.editSwipe,
  },
  deleteBtn: {
    backgroundColor: C.deleteSwipe,
  },
  trailingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
});
