import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/theme';

type Props = { message: string };

export function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="musical-notes-outline" size={32} color={C.textSecondary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  message: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
  },
});
