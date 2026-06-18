import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '@/constants/theme';

type Props = {
  title: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, onSeeAll }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  seeAll: {
    fontSize: 13,
    color: C.accent,
  },
});
