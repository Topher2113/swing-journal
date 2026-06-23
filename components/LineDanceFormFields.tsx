import { Text, TextInput } from 'react-native';
import { SegmentedControl } from '@/components/SegmentedControl';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { StepListEditor } from '@/components/StepListEditor';
import { LinkedSongPicker } from '@/components/LinkedSongPicker';
import { DIFFICULTIES, Difficulty } from '@/types/Move';
import { LineDanceStep } from '@/types/LineDance';
import { useTheme } from '@/context/ThemeContext';
import { useCommonStyles } from '@/constants/commonStyles';

type Props = {
  name: string;
  onNameChange: (text: string) => void;
  nameError?: string | null;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  steps: LineDanceStep[];
  onStepsChange: (steps: LineDanceStep[]) => void;
  videoUri: string | null;
  onRecord: () => void;
  onPick: () => void;
  onClearVideo: () => void;
  linkedSongId: string | null;
  onLinkedSongChange: (id: string | null) => void;
  notes: string;
  onNotesChange: (text: string) => void;
};

export function LineDanceFormFields(props: Props) {
  const { colors: C } = useTheme();
  const cs = useCommonStyles();
  const {
    name, onNameChange, nameError,
    difficulty, onDifficultyChange,
    steps, onStepsChange,
    videoUri, onRecord, onPick, onClearVideo,
    linkedSongId, onLinkedSongChange,
    notes, onNotesChange,
  } = props;

  return (
    <>
      <Text style={cs.label}>Name</Text>
      <TextInput
        style={[cs.textInput, nameError ? cs.textInputError : null]}
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g. Cotton Eye Joe"
        placeholderTextColor={C.textSecondary}
        returnKeyType="done"
      />
      {nameError ? <Text style={cs.fieldError}>{nameError}</Text> : null}

      <Text style={cs.label}>Difficulty</Text>
      <SegmentedControl
        options={DIFFICULTIES}
        value={difficulty}
        onChange={(v) => onDifficultyChange(v as Difficulty)}
      />

      <Text style={cs.label}>Steps (optional)</Text>
      <StepListEditor steps={steps} onChange={onStepsChange} />

      <Text style={cs.label}>Video (optional)</Text>
      <VideoPickerButtons
        videoUri={videoUri}
        onRecord={onRecord}
        onPick={onPick}
        onClear={onClearVideo}
      />

      <Text style={cs.label}>Linked Song (optional)</Text>
      <LinkedSongPicker linkedSongId={linkedSongId} onChange={onLinkedSongChange} />

      <Text style={cs.label}>Notes (optional)</Text>
      <TextInput
        style={[cs.textInput, cs.multiline]}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Cues, styling notes, things to remember…"
        placeholderTextColor={C.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </>
  );
}
