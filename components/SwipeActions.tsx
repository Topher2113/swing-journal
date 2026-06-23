import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = { onEdit: () => void; onDelete: () => void };

export function SwipeActions({ onEdit, onDelete }: Props) {
  const { colors: C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    actions: {
      flexDirection: 'row',
      marginBottom: 6,
      borderRadius: RADIUS.card,
      overflow: 'hidden',
    },
    actionBtn: {
      width: 72,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    editBtn: {
      backgroundColor: C.editSwipe,
    },
    deleteBtn: {
      backgroundColor: C.deleteSwipe,
    },
    actionLabel: {
      fontSize: 11,
      color: '#fff',
      fontWeight: '500',
    },
  }), [C]);

  return (
    <View style={styles.actions}>
      <Pressable
        style={[styles.actionBtn, styles.editBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onEdit}
      >
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.actionBtn, styles.deleteBtn]}
        android_ripple={{ color: 'transparent' }}
        onPress={onDelete}
      >
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </Pressable>
    </View>
  );
}
