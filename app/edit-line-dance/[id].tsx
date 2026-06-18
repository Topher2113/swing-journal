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
import { useVideoPickerHandlers } from '@/hooks/useVideoPickerHandlers';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StepListEditor } from '@/components/StepListEditor';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { LinkedSongPicker } from '@/components/LinkedSongPicker';
import { SaveButton } from '@/components/SaveButton';
import { DIFFICULTIES, Difficulty } from '@/types/Move';
import { LineDanceStep } from '@/types/LineDance';
import { C } from '@/constants/theme';
import { cs } from '@/constants/commonStyles';

export default function EditLineDanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lineDance, updateLineDance } = useLineDance(id);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [steps, setSteps] = useState<LineDanceStep[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [linkedSongId, setLinkedSongId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const seeded = useRef(false);
  const { handleRecord, handlePick } = useVideoPickerHandlers(setVideoUri);

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
        style={cs.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={cs.container}
          contentContainerStyle={cs.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={cs.label}>Name</Text>
          <TextInput
            style={[cs.textInput, nameError ? cs.textInputError : null]}
            value={name}
            onChangeText={(t) => { setName(t); if (nameError) setNameError(null); }}
            placeholder="e.g. Cotton Eye Joe"
            placeholderTextColor={C.textSecondary}
            returnKeyType="done"
          />
          {nameError && <Text style={styles.fieldError}>{nameError}</Text>}

          <Text style={cs.label}>Difficulty</Text>
          <SegmentedControl
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => setDifficulty(v as Difficulty)}
          />

          <Text style={cs.label}>Steps (optional)</Text>
          <StepListEditor steps={steps} onChange={setSteps} />

          <Text style={cs.label}>Video (optional)</Text>
          <VideoPickerButtons
            videoUri={videoUri}
            onRecord={handleRecord}
            onPick={handlePick}
            onClear={handleClear}
          />

          <Text style={cs.label}>Linked Song (optional)</Text>
          <LinkedSongPicker linkedSongId={linkedSongId} onChange={setLinkedSongId} />

          <Text style={cs.label}>Notes (optional)</Text>
          <TextInput
            style={[cs.textInput, styles.multiline]}
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
