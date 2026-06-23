import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = { category: string; count: number };

export function CategoryHeaderTitle({ category, count }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
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
    <View>
      <Text style={styles.title}>{category}</Text>
      <Text style={styles.subtitle}>{count} move{count !== 1 ? 's' : ''}</Text>
    </View>
  );
}
