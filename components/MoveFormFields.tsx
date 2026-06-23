import { Text, TextInput } from 'react-native';
import { SegmentedControl } from '@/components/SegmentedControl';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { MotionRecorderButton } from '@/components/MotionRecorderButton';
import { CATEGORY_LABELS, CATEGORY_SHORT, DIFFICULTIES, Category, Difficulty } from '@/types/Move';
import type { MotionFrame } from '@/types/Move';
import { C } from '@/constants/theme';
import { cs } from '@/constants/commonStyles';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

type Props = {
  name: string;
  onNameChange: (text: string) => void;
  nameError?: string | null;
  category: Category;
  onCategoryChange: (label: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  notes: string;
  onNotesChange: (text: string) => void;
  videoUri: string | null;
  onRecord: () => void;
  onPick: () => void;
  onClearVideo: () => void;
  isRecording?: boolean;
  motionFrames?: MotionFrame[] | null;
  onStartMotion?: () => void;
  onStopMotion?: () => void;
  onDiscardMotion?: () => void;
};

export function MoveFormFields(props: Props) {
  const {
    name, onNameChange, nameError,
    category, onCategoryChange,
    difficulty, onDifficultyChange,
    notes, onNotesChange,
    videoUri, onRecord, onPick, onClearVideo,
    isRecording, motionFrames, onStartMotion, onStopMotion, onDiscardMotion,
  } = props;

  return (
    <>
      <Text style={cs.label}>Move name</Text>
      <TextInput
        style={[cs.textInput, nameError ? cs.textInputError : null]}
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g. Triple Dip"
        placeholderTextColor={C.textSecondary}
        returnKeyType="done"
      />
      {nameError ? <Text style={cs.fieldError}>{nameError}</Text> : null}

      <Text style={cs.label}>Category</Text>
      <SegmentedControl
        options={CATEGORY_LABELS}
        value={CATEGORY_SHORT[category]}
        onChange={onCategoryChange}
      />

      <Text style={cs.label}>Difficulty</Text>
      <SegmentedControl
        options={DIFFICULTIES}
        value={difficulty}
        onChange={(v) => onDifficultyChange(v as Difficulty)}
      />

      <Text style={cs.label}>Notes</Text>
      <TextInput
        style={[cs.textInput, cs.multiline]}
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Cues, timing, things to remember…"
        placeholderTextColor={C.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={cs.label}>Video (optional)</Text>
      <VideoPickerButtons
        videoUri={videoUri}
        onRecord={onRecord}
        onPick={onPick}
        onClear={onClearVideo}
      />

      {MOTION_TRACKING_ENABLED && onStartMotion && onStopMotion && onDiscardMotion && (
        <>
          <Text style={cs.label}>Motion Capture (optional)</Text>
          <MotionRecorderButton
            isRecording={isRecording ?? false}
            frames={motionFrames ?? []}
            onStart={onStartMotion}
            onStop={onStopMotion}
            onDiscard={onDiscardMotion}
          />
        </>
      )}
    </>
  );
}
