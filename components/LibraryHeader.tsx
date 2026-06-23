import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = { title: string; count: number; label: string };

export function LibraryHeader({ title, count, label }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
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
  }), [C]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{count} {label}{count !== 1 ? 's' : ''} logged</Text>
    </View>
  );
}
