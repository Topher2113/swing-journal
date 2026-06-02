import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMove } from '@/hooks/useMove';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { saveMove } from '@/storage/moves';
import { SegmentedControl } from '@/components/SegmentedControl';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { CATEGORIES, DIFFICULTIES, CATEGORY_SHORT, Category, Difficulty } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

const CATEGORY_LABELS = CATEGORIES.map((c) => CATEGORY_SHORT[c]);

export default function EditMoveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { move } = useMove(id);
  const { recordVideo, pickVideo } = useVideoRecorder();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Footwork');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!move) return;
    setName(move.name);
    setCategory(move.category);
    setDifficulty(move.difficulty);
    setNotes(move.notes);
    setVideoUri(move.videoUri);
  }, [move]);

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

  const handleSave = async () => {
    if (!move || !name.trim()) return;
    setSaving(true);
    try {
      await saveMove({ ...move, name: name.trim(), category, difficulty, notes, videoUri });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Move' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Move name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Triple Dip"
            placeholderTextColor={C.textSecondary}
            returnKeyType="done"
          />

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
            onClear={() => setVideoUri(null)}
          />

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              (saving || !name.trim()) && styles.saveBtnDisabled,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            android_ripple={{ color: 'transparent' }}
            onPress={handleSave}
            disabled={saving || !name.trim()}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
