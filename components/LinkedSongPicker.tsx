import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlbumArt } from '@/components/AlbumArt';
import { Ionicons } from '@expo/vector-icons';
import { useSongs } from '@/hooks/useSongs';
import { useSongSearch } from '@/hooks/useSongSearch';
import { SongSearchResultRow } from '@/components/SongSearchResultRow';
import { SpotifyTrackResult } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';

type Props = { linkedSongId: string | null; onChange: (id: string | null) => void };

type ModalMode = 'browse' | 'search';

export function LinkedSongPicker({ linkedSongId, onChange }: Props) {
  const { songs, addSong } = useSongs();
  const { search: searchSpotify, loading: searchLoading } = useSongSearch();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrackResult[]>([]);
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const linkedSong = linkedSongId ? (songs.find((s) => s.id === linkedSongId) ?? null) : null;

  const openPicker = () => {
    setMode('browse');
    setSearchQuery('');
    setSearchResults([]);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim()) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchSpotify(text);
        setSearchResults(results);
      }, 400);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectExisting = (id: string) => {
    onChange(id);
    closePicker();
  };

  const handleAddFromSpotify = async (track: SpotifyTrackResult) => {
    if (adding) return;
    const existing = songs.find((s) => s.spotifyTrackId === track.id);
    if (existing) {
      onChange(existing.id);
      closePicker();
      return;
    }
    setAdding(true);
    try {
      const song = await addSong({
        title: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        albumArtUrl: track.album.images[0]?.url ?? null,
        spotifyUrl: track.external_urls.spotify,
        spotifyTrackId: track.id,
        notes: '',
      });
      onChange(song.id);
      closePicker();
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {linkedSong ? (
        <View style={styles.linkedRow}>
          <AlbumArt url={linkedSong.albumArtUrl} size={36} borderRadius={5} />
          <View style={styles.linkedInfo}>
            <Text style={styles.linkedTitle} numberOfLines={1}>{linkedSong.title}</Text>
            <Text style={styles.linkedArtist} numberOfLines={1}>{linkedSong.artist}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={openPicker}
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
          style={({ pressed }) => [styles.linkBtn, { opacity: pressed ? 0.8 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={openPicker}
        >
          <Ionicons name="musical-notes-outline" size={16} color={C.accent} />
          <Text style={styles.linkBtnText}>Link a song</Text>
        </Pressable>
      )}

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={closePicker}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.backdrop} onPress={closePicker} />
          <View style={styles.sheet}>

            {/* ── Browse mode ─────────────────────────────────────────── */}
            {mode === 'browse' && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetHeading}>Pick a Song</Text>
                  <Pressable
                    onPress={closePicker}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
                <FlatList
                  data={songs}
                  keyExtractor={(s) => s.id}
                  contentContainerStyle={styles.sheetList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No songs in your library yet.</Text>
                  }
                  ListFooterComponent={
                    <Pressable
                      style={({ pressed }) => [styles.spotifyRow, { opacity: pressed ? 0.7 : 1 }]}
                      android_ripple={{ color: 'transparent' }}
                      onPress={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setMode('search');
                      }}
                    >
                      <Ionicons name="search" size={18} color={C.accent} />
                      <Text style={styles.spotifyRowText}>Search Spotify to add a new song</Text>
                      <Ionicons name="chevron-forward" size={16} color={C.textSecondary} />
                    </Pressable>
                  }
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.7 : 1 }]}
                      android_ripple={{ color: 'transparent' }}
                      onPress={() => handleSelectExisting(item.id)}
                    >
                      <AlbumArt url={item.albumArtUrl} size={40} />
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
              </>
            )}

            {/* ── Search mode ─────────────────────────────────────────── */}
            {mode === 'search' && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetHeading}>Search Spotify</Text>
                  <Pressable
                    onPress={() => setMode('browse')}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={styles.cancelText}>Back</Text>
                  </Pressable>
                </View>
                <View style={styles.searchWrap}>
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder="Song title or artist…"
                    placeholderTextColor={C.textSecondary}
                    returnKeyType="search"
                    autoFocus
                  />
                </View>
                {(searchLoading || adding) && (
                  <ActivityIndicator color={C.accent} style={styles.loader} />
                )}
                {!searchLoading && !adding && searchQuery.trim() !== '' && searchResults.length === 0 && (
                  <Text style={styles.emptyText}>No results found.</Text>
                )}
                <View pointerEvents={adding ? 'none' : 'auto'}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(t) => t.id}
                    contentContainerStyle={styles.sheetList}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <SongSearchResultRow
                        track={item}
                        onPress={() => handleAddFromSpotify(item)}
                      />
                    )}
                  />
                </View>
              </>
            )}

          </View>
        </KeyboardAvoidingView>
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
  linkBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
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
    maxHeight: '75%',
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
  searchWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  searchInput: {
    backgroundColor: C.bg,
    borderRadius: RADIUS.control,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: C.textPrimary,
  },
  loader: {
    marginVertical: 16,
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
  spotifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.bg,
    borderRadius: RADIUS.card,
    padding: 14,
    marginTop: 4,
  },
  spotifyRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
  },
  emptyText: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
