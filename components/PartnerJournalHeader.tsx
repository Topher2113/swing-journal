import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  partnerEmail: string;
  partnerName?: string | null;
  syncing: boolean;
  onSync: () => void;
};

export function PartnerJournalHeader({ partnerEmail, partnerName, syncing, onSync }: Props) {
  const { colors: C } = useTheme();
  const display = partnerName ?? partnerEmail;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: C.surface,
      borderBottomWidth: 0.5,
      borderBottomColor: C.border,
      gap: 8,
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    label: {
      fontSize: 13,
      color: C.textSecondary,
      flex: 1,
    },
    email: {
      color: C.textPrimary,
      fontWeight: '500',
    },
  }), [C]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="people-outline" size={16} color={C.textSecondary} />
        <Text style={styles.label} numberOfLines={1}>
          Shared with <Text style={styles.email}>{display}</Text>
        </Text>
      </View>
      <Pressable
        onPress={onSync}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        disabled={syncing}
      >
        {syncing
          ? <ActivityIndicator size="small" color={C.textSecondary} />
          : <Ionicons name="sync-outline" size={18} color={C.textSecondary} />
        }
      </Pressable>
    </View>
  );
}
