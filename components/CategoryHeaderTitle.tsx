import { StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/theme';

type Props = { category: string; count: number };

export function CategoryHeaderTitle({ category, count }: Props) {
  return (
    <View>
      <Text style={styles.title}>{category}</Text>
      <Text style={styles.subtitle}>{count} move{count !== 1 ? 's' : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
