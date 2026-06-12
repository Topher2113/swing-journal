import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLineDance } from '@/hooks/useLineDance';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StepListEditor } from '@/components/StepListEditor';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { LinkedSongPicker } from '@/components/LinkedSongPicker';
import { SaveButton } from '@/components/SaveButton';
import { DIFFICULTIES, Difficulty } from '@/types/Move';
import { LineDanceStep } from '@/types/LineDance';
import { C, RADIUS } from '@/constants/theme';

export default function EditLineDanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lineDance, updateLineDance } = useLineDance(id);
  const { recordVideo, pickVideo } = useVideoRecorder();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [steps, setSteps] = useState<LineDanceStep[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [linkedSongId, setLinkedSongId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!lineDance || seeded.current) return;
    seeded.current = true;
    setName(lineDance.name);
    setDifficulty(lineDance.difficulty);
    setSteps(lineDance.steps);
    setVideoUri(lineDance.videoUri);
    setLinkedSongId(lineDance.linkedSongId);
    setNotes(lineDance.notes);
  }, [lineDance]);

  const handleRecord = async () => {
    const uri = await recordVideo();
    if (uri) setVideoUri(uri);
  };

  const handlePick = async () => {
    const uri = await pickVideo();
    if (uri) setVideoUri(uri);
  };

  const handleClear = () => setVideoUri(null);

  const handleSave = async () => {
    if (!lineDance) return;
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateLineDance({
        ...lineDance,
        name: name.trim(),
        difficulty,
        steps: steps.filter((s) => s.name.trim()).map((s, i) => ({ ...s, order: i + 1 })),
        videoUri,
        linkedSongId,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Line Dance' }} />
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
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(t) => { setName(t); if (nameError) setNameError(null); }}
            placeholder="e.g. Cotton Eye Joe"
            placeholderTextColor={C.textSecondary}
            returnKeyType="done"
          />
          {nameError && <Text style={styles.fieldError}>{nameError}</Text>}

          <Text style={styles.label}>Difficulty</Text>
          <SegmentedControl
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => setDifficulty(v as Difficulty)}
          />

          <Text style={styles.label}>Steps (optional)</Text>
          <StepListEditor steps={steps} onChange={setSteps} />

          <Text style={styles.label}>Video (optional)</Text>
          <VideoPickerButtons
            videoUri={videoUri}
            onRecord={handleRecord}
            onPick={handlePick}
            onClear={handleClear}
          />

          <Text style={styles.label}>Linked Song (optional)</Text>
          <LinkedSongPicker linkedSongId={linkedSongId} onChange={setLinkedSongId} />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Cues, styling notes, things to remember…"
            placeholderTextColor={C.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <SaveButton label="Save Changes" saving={saving} disabled={!name.trim()} onPress={handleSave} />
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
});
