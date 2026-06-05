import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMoves } from '@/hooks/useMoves';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { useMotionRecorder } from '@/hooks/useMotionRecorder';
import { SegmentedControl } from '@/components/SegmentedControl';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { MotionRecorderButton } from '@/components/MotionRecorderButton';
import { CATEGORIES, DIFFICULTIES, CATEGORY_SHORT, Category, Difficulty } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

const CATEGORY_LABELS = CATEGORIES.map((c) => CATEGORY_SHORT[c]);

export default function AddMoveScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { addMove } = useMoves();
  const { recordVideo, pickVideo } = useVideoRecorder();
  const { isRecording, frames, start: startMotion, stop: stopMotion, clear: clearMotion } = useMotionRecorder();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('Footwork');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setName('');
      setNameError(null);
      setCategory('Footwork');
      setDifficulty('Beginner');
      setNotes('');
      setVideoUri(null);
      clearMotion();
    }, [clearMotion])
  );

  const handleCategoryChange = (label: string) => {
    const full = CATEGORIES[CATEGORY_LABELS.indexOf(label)];
    if (full) setCategory(full);
  };

  const handleRecord = async () => {
    const uri = await recordVideo();
    if (uri) setVideoUri(uri);
  };

  const handlePick = async () => {
    const uri = await pickVideo();
    if (uri) setVideoUri(uri);
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
      await addMove({
        name: name.trim(),
        category,
        difficulty,
        notes,
        videoUri,
        motionData: MOTION_TRACKING_ENABLED ? frames : null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/');
    } finally {
      setSaving(false);
    }
  };

  return (
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

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            saving && styles.saveBtnDisabled,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          android_ripple={{ color: 'transparent' }}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Move'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.bg,
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
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.card,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textPrimary,
  },
});
