import { StyleSheet, Text, View } from 'react-native';
import { C, RADIUS } from '@/constants/theme';

type Props = { value: number; label: string };

export function StatCard({ value, label }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 20,
  },
  value: {
    fontSize: 36,
    fontWeight: '500',
    color: C.accent,
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: C.textSecondary,
  },
});
