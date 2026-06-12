import { Pressable, StyleSheet, Text } from 'react-native';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  label: string;
  saving: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SaveButton({ label, saving, disabled, onPress }: Props) {
  const isDisabled = saving || disabled;
  return (
    <Pressable
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

const styles = StyleSheet.create({
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
});
