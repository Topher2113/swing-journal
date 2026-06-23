import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSong } from '@/hooks/useSong';
import { useSongSearch } from '@/hooks/useSongSearch';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { AlbumArt } from '@/components/AlbumArt';
import { SaveButton } from '@/components/SaveButton';
import { SongSearchResultRow } from '@/components/SongSearchResultRow';
import { SpotifyTrackResult } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';
import { cs } from '@/constants/commonStyles';

export default function EditSongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { song, updateSong } = useSong(id);
  const { search: searchSpotify, loading: searchLoading } = useSongSearch();

  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackArtUrl, setTrackArtUrl] = useState<string | null>(null);
  const [trackSpotifyUrl, setTrackSpotifyUrl] = useState<string | null>(null);
  const [trackSpotifyTrackId, setTrackSpotifyTrackId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const {
    query: searchQuery,
    results: searchResults,
    setResults: setSearchResults,
    setQuery: setSearchQuery,
    handleChange: handleSearchChange,
  } = useDebounceSearch<SpotifyTrackResult>(searchSpotify);
  const [saving, setSaving] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!song || seeded.current) return;
    seeded.current = true;
    setTrackTitle(song.title);
    setTrackArtist(song.artist);
    setTrackArtUrl(song.albumArtUrl);
    setTrackSpotifyUrl(song.spotifyUrl);
    setTrackSpotifyTrackId(song.spotifyTrackId);
    setNotes(song.notes);
  }, [song]);

  const handleSelectTrack = (track: SpotifyTrackResult) => {
    setTrackTitle(track.name);
    setTrackArtist(track.artists.map((a) => a.name).join(', '));
    setTrackArtUrl(track.album.images[0]?.url ?? null);
    setTrackSpotifyUrl(track.external_urls.spotify);
    setTrackSpotifyTrackId(track.id);
    setSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!song || !trackTitle.trim()) return;
    setSaving(true);
    try {
      await updateSong({
        ...song,
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        albumArtUrl: trackArtUrl,
        spotifyUrl: trackSpotifyUrl,
        spotifyTrackId: trackSpotifyTrackId,
        notes: notes.trim(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Song' }} />
      <KeyboardAvoidingView
        style={cs.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={cs.container}
          contentContainerStyle={cs.content}
          keyboardShouldPersistTaps="handled"
        >
          {searchMode ? (
            <>
              <Text style={cs.label}>Search Spotify</Text>
              <TextInput
                style={cs.textInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Song title or artist…"
                placeholderTextColor={C.textSecondary}
                returnKeyType="search"
                autoFocus
              />
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.8 : 1 }]}
                android_ripple={{ color: 'transparent' }}
                onPress={() => {
                  setSearchMode(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              {searchLoading && <ActivityIndicator color={C.accent} style={styles.loader} />}
              {searchResults.map((track) => (
                <SongSearchResultRow
                  key={track.id}
                  track={track}
                  onPress={() => handleSelectTrack(track)}
                />
              ))}
              {!searchLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
                <Text style={styles.noResults}>No results found.</Text>
              )}
            </>
          ) : (
            <>
              <Text style={cs.label}>Track</Text>
              <View style={styles.attachedRow}>
                <AlbumArt url={trackArtUrl} size={44} />
                <View style={styles.attachedInfo}>
                  <Text style={styles.attachedTitle} numberOfLines={1}>{trackTitle}</Text>
                  <Text style={styles.attachedArtist} numberOfLines={1}>{trackArtist}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.changeBtn, { opacity: pressed ? 0.8 : 1 }]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => setSearchMode(true)}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </Pressable>
              </View>

              <Text style={cs.label}>Notes (optional)</Text>
              <TextInput
                style={[cs.textInput, styles.multiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Why you love this song, what you dance to it…"
                placeholderTextColor={C.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <SaveButton label="Save Changes" saving={saving} disabled={!trackTitle.trim()} onPress={handleSave} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 120,
  },
  loader: {
    marginVertical: 16,
  },
  noResults: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  cancelBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    color: C.accent,
    fontWeight: '600',
  },
  attachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 12,
    gap: 12,
  },
  attachedInfo: {
    flex: 1,
    gap: 3,
  },
  attachedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  attachedArtist: {
    fontSize: 13,
    color: C.textSecondary,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.border,
    borderRadius: RADIUS.chip,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textPrimary,
  },
});
