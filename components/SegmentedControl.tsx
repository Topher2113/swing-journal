import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export function SegmentedControl({ options, value, onChange }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
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
    activeIndicator: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: C.accent,
      borderRadius: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: C.textSecondary,
    },
    labelActive: {
      color: C.textPrimary,
    },
  }), [C]);

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            style={({ pressed }) => [styles.option, { opacity: pressed ? 0.85 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={() => onChange(opt)}
          >
            {active && <View pointerEvents="none" style={styles.activeIndicator} />}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
