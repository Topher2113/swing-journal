import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMove } from '@/hooks/useMove';
import { useMoves } from '@/hooks/useMoves';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useVideoPickerHandlers } from '@/hooks/useVideoPickerHandlers';
import { useMotionRecorder } from '@/hooks/useMotionRecorder';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, isLocalUri } from '@/lib/videoStorage';
import { SaveButton } from '@/components/SaveButton';
import { MoveFormFields } from '@/components/MoveFormFields';
import { CATEGORIES, CATEGORY_LABELS, Category, Difficulty } from '@/types/Move';
import { useCommonStyles } from '@/constants/commonStyles';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function EditMoveScreen() {
  const cs = useCommonStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { move } = useMove(id);
  const { updateMove } = useMoves();
  const { user } = useAuth();
  const { link } = usePartnerLink();
  const { items: journalItems, upsertLocal: shareToJournal, sync: syncJournal } = usePartnerJournal(link?.id ?? '');
  const { isRecording, frames, start: startMotion, stop: stopMotion, seed: seedMotion, clear: clearMotion } = useMotionRecorder();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Footwork');
  const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
  const [notes, setNotes] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!move || seeded.current) return;
    seeded.current = true;
    setName(move.name);
    setCategory(move.category);
    setDifficulty(move.difficulty);
    setNotes(move.notes);
    setVideoUri(move.videoUri);
    seedMotion(move.motionData ?? null);
  }, [move, seedMotion]);

  const { handleRecord, handlePick } = useVideoPickerHandlers(setVideoUri);

  const handleCategoryChange = (label: string) => {
    const full = CATEGORIES[CATEGORY_LABELS.indexOf(label)];
    if (full) setCategory(full);
  };

  const handleSave = async () => {
    if (!move || !name.trim()) return;
    setSaving(true);
    try {
      await updateMove({
        ...move,
        name: name.trim(),
        category,
        difficulty,
        notes,
        videoUri,
        motionData: MOTION_TRACKING_ENABLED ? frames : null,
        updatedAt: new Date().toISOString(),
      });

      const existingShared = journalItems.find(
        (m) => m.originalMoveId === id && m.addedByUserId === user?.id
      );
      if (existingShared && link) {
        let sharedVideoUri = videoUri;
        if (sharedVideoUri && isLocalUri(sharedVideoUri)) {
          sharedVideoUri = await uploadVideo(sharedVideoUri, user!.id);
        }
        await shareToJournal({
          ...existingShared,
          name: name.trim(),
          category,
          difficulty,
          notes,
          videoUri: sharedVideoUri ?? existingShared.videoUri,
        });
        syncJournal();
      }

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
        style={cs.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={cs.container}
          contentContainerStyle={cs.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <MoveFormFields
            name={name}
            onNameChange={setName}
            category={category}
            onCategoryChange={handleCategoryChange}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            notes={notes}
            onNotesChange={setNotes}
            videoUri={videoUri}
            onRecord={handleRecord}
            onPick={handlePick}
            onClearVideo={() => setVideoUri(null)}
            isRecording={isRecording}
            motionFrames={frames}
            onStartMotion={startMotion}
            onStopMotion={stopMotion}
            onDiscardMotion={clearMotion}
          />

          <SaveButton label="Save Changes" saving={saving} disabled={!name.trim()} onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

