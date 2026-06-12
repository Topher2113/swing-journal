import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSongs } from '@/hooks/useSongs';
import { C, RADIUS } from '@/constants/theme';

type Props = { linkedSongId: string | null; onChange: (id: string | null) => void };

export function LinkedSongPicker({ linkedSongId, onChange }: Props) {
  const { songs } = useSongs();
  const [pickerVisible, setPickerVisible] = useState(false);
  const linkedSong = linkedSongId ? (songs.find((s) => s.id === linkedSongId) ?? null) : null;

  const handleSelect = (id: string) => {
    onChange(id);
    setPickerVisible(false);
  };

  return (
    <>
      {linkedSong ? (
        <View style={styles.linkedRow}>
          {linkedSong.albumArtUrl ? (
            <Image source={{ uri: linkedSong.albumArtUrl }} style={styles.art} />
          ) : (
            <View style={[styles.art, styles.artPlaceholder]}>
              <Ionicons name="musical-note" size={14} color={C.textSecondary} />
            </View>
          )}
          <View style={styles.linkedInfo}>
            <Text style={styles.linkedTitle} numberOfLines={1}>{linkedSong.title}</Text>
            <Text style={styles.linkedArtist} numberOfLines={1}>{linkedSong.artist}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.chipText}>Change</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.chip, styles.chipRemove, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => onChange(null)}
          >
            <Text style={[styles.chipText, styles.chipRemoveText]}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.linkBtn,
            songs.length === 0 && styles.linkBtnDisabled,
            { opacity: pressed && songs.length > 0 ? 0.8 : 1 },
          ]}
          android_ripple={{ color: 'transparent' }}
          onPress={() => songs.length > 0 && setPickerVisible(true)}
          disabled={songs.length === 0}
        >
          <Ionicons
            name="musical-notes-outline"
            size={16}
            color={songs.length > 0 ? C.accent : C.textSecondary}
          />
          <Text style={[styles.linkBtnText, songs.length === 0 && styles.linkBtnTextDisabled]}>
            {songs.length === 0 ? 'Add songs from the Song tab first' : 'Link a song'}
          </Text>
        </Pressable>
      )}

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={() => setPickerVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetHeading}>Pick a Song</Text>
              <Pressable
                onPress={() => setPickerVisible(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
            <FlatList
              data={songs}
              keyExtractor={(s) => s.id}
              contentContainerStyle={styles.sheetList}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.7 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => handleSelect(item.id)}
                >
                  {item.albumArtUrl ? (
                    <Image source={{ uri: item.albumArtUrl }} style={styles.sheetArt} />
                  ) : (
                    <View style={[styles.sheetArt, styles.artPlaceholder]}>
                      <Ionicons name="musical-note" size={16} color={C.textSecondary} />
                    </View>
                  )}
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.sheetArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  {item.id === linkedSongId && (
                    <Ionicons name="checkmark" size={20} color={C.accent} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 10,
  },
  art: {
    width: 36,
    height: 36,
    borderRadius: 5,
    flexShrink: 0,
  },
  artPlaceholder: {
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedInfo: {
    flex: 1,
    gap: 2,
  },
  linkedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
  },
  linkedArtist: {
    fontSize: 12,
    color: C.textSecondary,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: C.border,
    borderRadius: RADIUS.chip,
  },
  chipRemove: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textPrimary,
  },
  chipRemoveText: {
    color: '#EF4444',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkBtnDisabled: {
    opacity: 0.5,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
  },
  linkBtnTextDisabled: {
    color: C.textSecondary,
    fontWeight: '400',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  sheetHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  cancelText: {
    fontSize: 15,
    color: C.accent,
  },
  sheetList: {
    padding: 12,
    gap: 4,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 12,
  },
  sheetArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
  },
  sheetInfo: {
    flex: 1,
    gap: 3,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  sheetArtist: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
