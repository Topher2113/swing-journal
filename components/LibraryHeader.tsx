import { StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/theme';

type Props = { title: string; count: number; label: string };

export function LibraryHeader({ title, count, label }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{count} {label}{count !== 1 ? 's' : ''} logged</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: C.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },
});
