import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/theme';

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            style={[styles.option, active && styles.optionActive]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: C.accent,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
  labelActive: {
    color: C.textPrimary,
  },
});
