import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, RADIUS } from '@/constants/theme';

type Props = { count: number; onIncrement: () => void };

export function PracticeCounter({ count, onIncrement }: Props) {
  const handlePress = () => {
    onIncrement();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return (
    <View style={styles.row}>
      <View style={styles.countBox}>
        <Text style={styles.icon}>↻</Text>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>practices</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={handlePress}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 16,
  },
  countBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 22,
    color: C.accent,
  },
  count: {
    fontSize: 28,
    fontWeight: '600',
    color: C.textPrimary,
  },
  label: {
    fontSize: 14,
    color: C.textSecondary,
    alignSelf: 'flex-end',
    marginBottom: 3,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 28,
    fontWeight: '300',
    color: C.textPrimary,
    lineHeight: 32,
  },
});
