import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineDanceStep } from '@/types/LineDance';
import { C, RADIUS } from '@/constants/theme';

type Props = { steps: LineDanceStep[]; onChange: (steps: LineDanceStep[]) => void };

export function StepListEditor({ steps, onChange }: Props) {
  const updateStep = (index: number, field: 'name' | 'description', value: string) => {
    onChange(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    onChange([...steps, { order: steps.length + 1, name: '', description: '' }]);
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View style={styles.inputs}>
            <TextInput
              style={styles.input}
              value={step.name}
              onChangeText={(v) => updateStep(index, 'name', v)}
              placeholder="Step name"
              placeholderTextColor={C.textSecondary}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.input, styles.descInput]}
              value={step.description}
              onChangeText={(v) => updateStep(index, 'description', v)}
              placeholder="Description (optional)"
              placeholderTextColor={C.textSecondary}
              returnKeyType="done"
            />
          </View>
          <View style={styles.controls}>
            <Pressable
              style={[styles.controlBtn, index === 0 && styles.controlBtnDisabled]}
              onPress={() => moveUp(index)}
              disabled={index === 0}
            >
              <Ionicons name="chevron-up" size={16} color={index === 0 ? C.border : C.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.controlBtn, index === steps.length - 1 && styles.controlBtnDisabled]}
              onPress={() => moveDown(index)}
              disabled={index === steps.length - 1}
            >
              <Ionicons name="chevron-down" size={16} color={index === steps.length - 1 ? C.border : C.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.controlBtn, styles.removeBtn]}
              onPress={() => remove(index)}
            >
              <Ionicons name="close" size={16} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={addStep}
      >
        <Ionicons name="add" size={18} color={C.accent} />
        <Text style={styles.addBtnText}>Add step</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  inputs: {
    flex: 1,
    gap: 6,
  },
  input: {
    backgroundColor: C.bg,
    borderRadius: RADIUS.control,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: C.textPrimary,
    minHeight: 38,
  },
  descInput: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  controlBtn: {
    padding: 5,
    borderRadius: 4,
  },
  controlBtnDisabled: {
    opacity: 0.3,
  },
  removeBtn: {
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.accent,
  },
});
