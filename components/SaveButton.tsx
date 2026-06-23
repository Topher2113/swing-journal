import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  label: string;
  saving: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SaveButton({ label, saving, disabled, onPress }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    btn: {
      backgroundColor: C.accent,
      borderRadius: RADIUS.card,
      paddingVertical: 18,
      alignItems: 'center',
      marginTop: 16,
    },
    btnDisabled: {
      opacity: 0.5,
    },
    label: {
      fontSize: 17,
      fontWeight: '600',
      color: C.textPrimary,
    },
  }), [C]);

  const isDisabled = saving || disabled;
  return (
    <Pressable
      role="button"
      style={({ pressed }) => [
        styles.btn,
        isDisabled && styles.btnDisabled,
        { opacity: pressed && !isDisabled ? 0.85 : 1 },
      ]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text style={styles.label}>{saving ? 'Saving…' : label}</Text>
    </Pressable>
  );
}
