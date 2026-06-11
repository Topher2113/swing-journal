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
            style={[styles.option, active ? styles.optionActive : styles.optionInactive]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.border,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    minHeight: 42,
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: C.accent,
  },
  optionInactive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  labelActive: {
    color: C.textPrimary,
  },
});
