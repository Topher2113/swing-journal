import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = { notes: string };

export function NotesBox({ notes }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    notesBox: {
      backgroundColor: C.surface,
      borderRadius: RADIUS.card,
      padding: 14,
      gap: 6,
      borderLeftWidth: 3,
      borderLeftColor: C.accent,
    },
    notesLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: C.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notesText: {
      fontSize: 15,
      color: C.textPrimary,
      lineHeight: 22,
    },
  }), [C]);

  return (
    <View style={styles.notesBox}>
      <Text style={styles.notesLabel}>Notes</Text>
      <Text style={styles.notesText}>{notes}</Text>
    </View>
  );
}
