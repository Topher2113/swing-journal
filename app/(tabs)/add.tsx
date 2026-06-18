import { useCallback, useRef, useState } from 'react';
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
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { useMoves } from '@/hooks/useMoves';
import { useSongs } from '@/hooks/useSongs';
import { useLineDances } from '@/hooks/useLineDances';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, isLocalUri } from '@/lib/videoStorage';
import { useSongSearch } from '@/hooks/useSongSearch';
import { useVideoPickerHandlers } from '@/hooks/useVideoPickerHandlers';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { useMotionRecorder } from '@/hooks/useMotionRecorder';
import { AlbumArt } from '@/components/AlbumArt';
import { SaveButton } from '@/components/SaveButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SongSearchResultRow } from '@/components/SongSearchResultRow';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { StepListEditor } from '@/components/StepListEditor';
import { LinkedSongPicker } from '@/components/LinkedSongPicker';
import { MotionRecorderButton } from '@/components/MotionRecorderButton';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_SHORT, DIFFICULTIES, Category, Difficulty, SharedMove } from '@/types/Move';
import { LineDanceStep } from '@/types/LineDance';
import { SpotifyTrackResult } from '@/types/Song';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

const ADD_SEGMENTS = ['Move', 'Line Dance', 'Song'];
type AddSegment = 'Move' | 'Line Dance' | 'Song';

export default function AddScreen() {
  const router = useRouter();
  const { addMove } = useMoves();
  const { addSong } = useSongs();
  const { addLineDance } = useLineDances();
  const { link } = usePartnerLink();
  const { upsertLocal: shareToJournal } = usePartnerJournal(link?.id ?? '');
  const { user } = useAuth();
  const { search: searchSpotify, loading: searchLoading } = useSongSearch();
  const { isRecording, frames, start: startMotion, stop: stopMotion, clear: clearMotion } =
    useMotionRecorder();

  const { segment: segmentParam } = useLocalSearchParams<{ segment?: string }>();
  const [segment, setSegment] = useState<AddSegment>('Move');

  // Move form state
  const scrollRef = useRef<ScrollView>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Footwork');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveToJournal, setSaveToJournal] = useState(false);

  // Song form state
  const {
    query: searchQuery,
    results: searchResults,
    setResults: setSearchResults,
    setQuery: setSearchQuery,
    handleChange: handleSearchQueryChange,
  } = useDebounceSearch<SpotifyTrackResult>(searchSpotify);
  const [attachedTrack, setAttachedTrack] = useState<SpotifyTrackResult | null>(null);
  const [songNotes, setSongNotes] = useState('');
  const [songSaving, setSongSaving] = useState(false);

  // Line Dance form state
  const [ldName, setLdName] = useState('');
  const [ldNameError, setLdNameError] = useState<string | null>(null);
  const [ldDifficulty, setLdDifficulty] = useState<Difficulty>('Beginner');
  const [ldSteps, setLdSteps] = useState<LineDanceStep[]>([]);
  const [ldVideoUri, setLdVideoUri] = useState<string | null>(null);
  const [ldLinkedSongId, setLdLinkedSongId] = useState<string | null>(null);
  const [ldNotes, setLdNotes] = useState('');
  const [ldSaving, setLdSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (segmentParam === 'Move' || segmentParam === 'Line Dance' || segmentParam === 'Song') {
        setSegment(segmentParam as AddSegment);
      }
      setName('');
      setNameError(null);
      setCategory('Footwork');
      setDifficulty('Beginner');
      setNotes('');
      setVideoUri(null);
      clearMotion();
      setSearchQuery('');
      setSearchResults([]);
      setAttachedTrack(null);
      setSongNotes('');
      setLdName('');
      setLdNameError(null);
      setLdDifficulty('Beginner');
      setLdSteps([]);
      setLdVideoUri(null);
      setLdLinkedSongId(null);
      setLdNotes('');
      setSaveToJournal(false);
    }, [clearMotion, segmentParam])
  );

  // ── Move handlers ────────────────────────────────────────────────────────────

  const { handleRecord, handlePick } = useVideoPickerHandlers(setVideoUri);
  const { handleRecord: handleLdRecord, handlePick: handleLdPick } = useVideoPickerHandlers(setLdVideoUri);

  const handleCategoryChange = (label: string) => {
    const full = CATEGORIES[CATEGORY_LABELS.indexOf(label)];
    if (full) setCategory(full);
  };

  const handleClear = useCallback(() => setVideoUri(null), []);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Move name is required');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    setSaving(true);
    try {
      // When sharing to journal, pre-upload the video once so both the personal
      // move and the shared move get the same cloud URL (avoids two uploads).
      // When not sharing, addMove handles the upload in the background.
      let resolvedVideoUri = videoUri;
      const willShare = saveToJournal && link?.status === 'linked' && user;
      if (willShare && videoUri && isLocalUri(videoUri) && user) {
        const publicUrl = await uploadVideo(videoUri, user.id);
        if (publicUrl) resolvedVideoUri = publicUrl;
      }

      const move = await addMove({
        name: name.trim(),
        category,
        difficulty,
        notes,
        videoUri: resolvedVideoUri,
        motionData: MOTION_TRACKING_ENABLED ? frames : null,
      });

      if (willShare) {
        const sharedMove: SharedMove = {
          ...move,
          id: Crypto.randomUUID(),
          partnerLinkId: link!.id,
          addedByUserId: user!.id,
          originalMoveId: move.id,
        };
        await shareToJournal(sharedMove);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  // ── Song handlers ────────────────────────────────────────────────────────────

  const handleSearchChange = (text: string) => {
    if (attachedTrack) setAttachedTrack(null);
    handleSearchQueryChange(text);
  };

  const handleAttachTrack = (track: SpotifyTrackResult) => {
    setAttachedTrack(track);
    setSearchResults([]);
  };

  const handleSaveSong = async () => {
    if (!attachedTrack) return;
    setSongSaving(true);
    try {
      await addSong({
        title: attachedTrack.name,
        artist: attachedTrack.artists.map((a) => a.name).join(', '),
        albumArtUrl: attachedTrack.album.images[0]?.url ?? null,
        spotifyUrl: attachedTrack.external_urls.spotify,
        spotifyTrackId: attachedTrack.id,
        notes: songNotes.trim(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } finally {
      setSongSaving(false);
    }
  };

  // ── Line Dance handlers ──────────────────────────────────────────────────────

  const handleLdClear = useCallback(() => setLdVideoUri(null), []);

  const handleSaveLineDance = async () => {
    if (!ldName.trim()) {
      setLdNameError('Name is required');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    setLdSaving(true);
    try {
      await addLineDance({
        name: ldName.trim(),
        difficulty: ldDifficulty,
        steps: ldSteps.filter((s) => s.name.trim()).map((s, i) => ({ ...s, order: i + 1 })),
        videoUri: ldVideoUri,
        linkedSongId: ldLinkedSongId,
        notes: ldNotes.trim(),
        practiceCount: 0,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } finally {
      setLdSaving(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const headerTitle =
    segment === 'Move' ? 'Add Move' : segment === 'Song' ? 'Add Song' : 'Add Line Dance';
  const attachedArtUrl = attachedTrack?.album.images[0]?.url ?? null;

  return (
    <>
      <Stack.Screen options={{ headerTitle }} />
      <View style={styles.flex}>
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={ADD_SEGMENTS}
            value={segment}
            onChange={(v) => setSegment(v as AddSegment)}
          />
        </View>

        {/* ── Move ─────────────────────────────────────────────────────────── */}
        {segment === 'Move' && (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.container}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Move name</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                value={name}
                onChangeText={(t) => { setName(t); if (nameError) setNameError(null); }}
                placeholder="e.g. Triple Dip"
                placeholderTextColor={C.textSecondary}
                returnKeyType="done"
              />
              {nameError && <Text style={styles.fieldError}>{nameError}</Text>}

              <Text style={styles.label}>Category</Text>
              <SegmentedControl
                options={CATEGORY_LABELS}
                value={CATEGORY_SHORT[category]}
                onChange={handleCategoryChange}
              />

              <Text style={styles.label}>Difficulty</Text>
              <SegmentedControl
                options={DIFFICULTIES}
                value={difficulty}
                onChange={(v) => setDifficulty(v as Difficulty)}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Cues, timing, things to remember…"
                placeholderTextColor={C.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Video (optional)</Text>
              <VideoPickerButtons
                videoUri={videoUri}
                onRecord={handleRecord}
                onPick={handlePick}
                onClear={handleClear}
              />

              {MOTION_TRACKING_ENABLED && (
                <>
                  <Text style={styles.label}>Motion Capture (optional)</Text>
                  <MotionRecorderButton
                    isRecording={isRecording}
                    frames={frames}
                    onStart={startMotion}
                    onStop={stopMotion}
                    onDiscard={clearMotion}
                  />
                </>
              )}

              {link?.status === 'linked' && (
                <Pressable
                  style={styles.journalToggle}
                  onPress={() => setSaveToJournal((p) => !p)}
                >
                  <View style={[styles.checkbox, saveToJournal && styles.checkboxChecked]}>
                    {saveToJournal && <Ionicons name="checkmark" size={12} color={C.textPrimary} />}
                  </View>
                  <Text style={styles.journalToggleText}>Also save to shared journal</Text>
                </Pressable>
              )}

              <SaveButton label="Save Move" saving={saving} onPress={handleSave} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* ── Song ─────────────────────────────────────────────────────────── */}
        {segment === 'Song' && (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {!attachedTrack ? (
                <>
                  <Text style={styles.label}>Search Spotify</Text>
                  <TextInput
                    style={styles.input}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder="Song title or artist…"
                    placeholderTextColor={C.textSecondary}
                    returnKeyType="search"
                  />
                  {searchLoading && (
                    <ActivityIndicator color={C.accent} style={styles.loader} />
                  )}
                  {searchResults.map((track) => (
                    <SongSearchResultRow
                      key={track.id}
                      track={track}
                      onPress={() => handleAttachTrack(track)}
                    />
                  ))}
                  {!searchLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
                    <Text style={styles.noResults}>No results found.</Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.label}>Selected track</Text>
                  <View style={styles.attachedRow}>
                    <AlbumArt url={attachedArtUrl} size={44} />
                    <View style={styles.attachedInfo}>
                      <Text style={styles.attachedTitle} numberOfLines={1}>
                        {attachedTrack.name}
                      </Text>
                      <Text style={styles.attachedArtist} numberOfLines={1}>
                        {attachedTrack.artists.map((a) => a.name).join(', ')}
                      </Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.changeBtn, { opacity: pressed ? 0.8 : 1 }]}
                      android_ripple={{ color: 'transparent' }}
                      onPress={() => { setAttachedTrack(null); setSearchResults([]); }}
                    >
                      <Text style={styles.changeBtnText}>Change</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.label}>Notes (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    value={songNotes}
                    onChangeText={setSongNotes}
                    placeholder="Why you love this song, what you dance to it…"
                    placeholderTextColor={C.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <SaveButton label="Save Song" saving={songSaving} onPress={handleSaveSong} />
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* ── Line Dance ───────────────────────────────────────────────────── */}
        {segment === 'Line Dance' && (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, ldNameError ? styles.inputError : null]}
                value={ldName}
                onChangeText={(t) => { setLdName(t); if (ldNameError) setLdNameError(null); }}
                placeholder="e.g. Cotton Eye Joe"
                placeholderTextColor={C.textSecondary}
                returnKeyType="done"
              />
              {ldNameError && <Text style={styles.fieldError}>{ldNameError}</Text>}

              <Text style={styles.label}>Difficulty</Text>
              <SegmentedControl
                options={DIFFICULTIES}
                value={ldDifficulty}
                onChange={(v) => setLdDifficulty(v as Difficulty)}
              />

              <Text style={styles.label}>Steps (optional)</Text>
              <StepListEditor steps={ldSteps} onChange={setLdSteps} />

              <Text style={styles.label}>Video (optional)</Text>
              <VideoPickerButtons
                videoUri={ldVideoUri}
                onRecord={handleLdRecord}
                onPick={handleLdPick}
                onClear={handleLdClear}
              />

              <Text style={styles.label}>Linked Song (optional)</Text>
              <LinkedSongPicker linkedSongId={ldLinkedSongId} onChange={setLdLinkedSongId} />

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={ldNotes}
                onChangeText={setLdNotes}
                placeholder="Cues, styling notes, things to remember…"
                placeholderTextColor={C.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <SaveButton label="Save Line Dance" saving={ldSaving} onPress={handleSaveLineDance} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.bg,
  },
  segmentWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textPrimary,
    minHeight: 50,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -6,
  },
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
  journalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: C.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  journalToggleText: {
    fontSize: 14,
    color: C.textSecondary,
  },
});
