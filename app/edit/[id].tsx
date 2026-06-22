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
import { useMove } from '@/hooks/useMove';
import { useMoves } from '@/hooks/useMoves';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useVideoPickerHandlers } from '@/hooks/useVideoPickerHandlers';
import { useMotionRecorder } from '@/hooks/useMotionRecorder';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, isLocalUri } from '@/lib/videoStorage';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SaveButton } from '@/components/SaveButton';
import { VideoPickerButtons } from '@/components/VideoPickerButtons';
import { MotionRecorderButton } from '@/components/MotionRecorderButton';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_SHORT, DIFFICULTIES, Category, Difficulty } from '@/types/Move';
import { C } from '@/constants/theme';
import { cs } from '@/constants/commonStyles';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function EditMoveScreen() {
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
          keyboardShouldPersistTaps="handled"
        >
          <Text style={cs.label}>Move name</Text>
          <TextInput
            style={cs.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Triple Dip"
            placeholderTextColor={C.textSecondary}
            returnKeyType="done"
          />

          <Text style={cs.label}>Category</Text>
          <SegmentedControl
            options={CATEGORY_LABELS}
            value={CATEGORY_SHORT[category]}
            onChange={handleCategoryChange}
          />

          <Text style={cs.label}>Difficulty</Text>
          <SegmentedControl
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => setDifficulty(v as Difficulty)}
          />

          <Text style={cs.label}>Notes</Text>
          <TextInput
            style={[cs.textInput, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Cues, timing, things to remember…"
            placeholderTextColor={C.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={cs.label}>Video (optional)</Text>
          <VideoPickerButtons
            videoUri={videoUri}
            onRecord={handleRecord}
            onPick={handlePick}
            onClear={() => setVideoUri(null)}
          />

          {MOTION_TRACKING_ENABLED && (
            <>
              <Text style={cs.label}>Motion Capture (optional)</Text>
              <MotionRecorderButton
                isRecording={isRecording}
                frames={frames}
                onStart={startMotion}
                onStop={stopMotion}
                onDiscard={clearMotion}
              />
            </>
          )}

          <SaveButton label="Save Changes" saving={saving} disabled={!name.trim()} onPress={handleSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 120,
  },
});
