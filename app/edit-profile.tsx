import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { C, RADIUS } from '@/constants/theme';
import type { UserProfile } from '@/types/Auth';

type DancePref = UserProfile['dancePreference'];
type Level = UserProfile['level'];

const DANCE_PREFS: { value: DancePref; label: string }[] = [
  { value: 'swing', label: 'Swing' },
  { value: 'line_dancing', label: 'Line Dancing' },
  { value: 'both', label: 'Both' },
];

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting started' },
  { value: 'intermediate', label: 'Intermediate', description: 'Know the basics' },
  { value: 'advanced', label: 'Advanced', description: 'Been dancing a while' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [dancePref, setDancePref] = useState<DancePref>(profile?.dancePreference ?? 'both');
  const [level, setLevel] = useState<Level>(profile?.level ?? 'beginner');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('user_profiles')
        .update({ name: name.trim(), dance_preference: dancePref, level })
        .eq('id', user.id);
      if (err) throw err;
      await refreshProfile();
      router.back();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={C.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="done"
          />
        </View>

        {/* Dance preference */}
        <View style={styles.section}>
          <Text style={styles.label}>What kind of dancing do you prefer?</Text>
          <View style={styles.chipRow}>
            {DANCE_PREFS.map(({ value, label }) => (
              <Pressable
                key={value}
                style={({ pressed }) => [
                  styles.chip,
                  dancePref === value && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => setDancePref(value)}
              >
                <Text style={[styles.chipText, dancePref === value && styles.chipTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Experience level */}
        <View style={styles.section}>
          <Text style={styles.label}>What's your experience level?</Text>
          <View style={styles.levelList}>
            {LEVELS.map(({ value, label, description }) => (
              <Pressable
                key={value}
                style={({ pressed }) => [
                  styles.levelCard,
                  level === value && styles.levelCardSelected,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => setLevel(value)}
              >
                <View style={[styles.radio, level === value && styles.radioSelected]} />
                <View style={styles.levelText}>
                  <Text style={[styles.levelLabel, level === value && styles.levelLabelSelected]}>
                    {label}
                  </Text>
                  <Text style={styles.levelDesc}>{description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={C.textPrimary} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
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
  content: {
    padding: 24,
    paddingTop: 28,
    gap: 28,
    paddingBottom: 48,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    padding: 14,
    fontSize: 16,
    color: C.textPrimary,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.control,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  chipTextSelected: {
    color: C.textPrimary,
  },
  levelList: {
    gap: 10,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  levelCardSelected: {
    borderColor: C.accent,
    backgroundColor: C.accent + '1A',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
  },
  radioSelected: {
    borderColor: C.accent,
    backgroundColor: C.accent,
  },
  levelText: {
    flex: 1,
    gap: 2,
  },
  levelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
  },
  levelLabelSelected: {
    color: C.textPrimary,
  },
  levelDesc: {
    fontSize: 13,
    color: C.textSecondary,
  },
  error: {
    color: C.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: C.accent,
    borderRadius: RADIUS.control,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    backgroundColor: C.accentDark,
  },
  buttonText: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
