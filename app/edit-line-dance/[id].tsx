import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLineDance } from '@/hooks/useLineDance';
import { useVideoPickerHandlers } from '@/hooks/useVideoPickerHandlers';
import { SaveButton } from '@/components/SaveButton';
import { LineDanceFormFields } from '@/components/LineDanceFormFields';
import { Difficulty } from '@/types/Move';
import { LineDanceStep } from '@/types/LineDance';
import { useCommonStyles } from '@/constants/commonStyles';

export default function EditLineDanceScreen() {
  const cs = useCommonStyles();
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
        steps: steps.filter((s) => s.name.trim() || s.description.trim()).map((s, i) => ({ ...s, order: i + 1 })),
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
          <LineDanceFormFields
            name={name}
            onNameChange={(t) => { setName(t); if (nameError) setNameError(null); }}
            nameError={nameError}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            steps={steps}
            onStepsChange={setSteps}
            videoUri={videoUri}
            onRecord={handleRecord}
            onPick={handlePick}
            onClearVideo={handleClear}
            linkedSongId={linkedSongId}
            onLinkedSongChange={setLinkedSongId}
            notes={notes}
            onNotesChange={setNotes}
          />

          <SaveButton label="Save Changes" saving={saving} disabled={!name.trim()} onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

