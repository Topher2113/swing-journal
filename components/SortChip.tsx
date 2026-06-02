import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, RADIUS } from '@/constants/theme';
import { SortDir } from '@/hooks/useSortedMoves';

type Props = {
  label: string;
  active: boolean;
  direction: SortDir;
  onPress: () => void;
};

export function SortChip({ label, active, direction, onPress }: Props) {
  return (
    <Pressable
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, { opacity: pressed ? 0.75 : 1 }]}
      android_ripple={{ color: 'transparent' }}
      onPress={onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>
        {label}{active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
      </Text>
      {active && (
        <Ionicons
          name={direction === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={C.textPrimary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.chip,
    borderWidth: 0.5,
    borderColor: '#3C3C43',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: C.accentDark,
    borderColor: C.accent,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: C.textSecondary,
  },
  labelActive: {
    color: C.textPrimary,
  },
});
