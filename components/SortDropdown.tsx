import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortDir } from '@/hooks/useSortedMoves';
import { C, RADIUS } from '@/constants/theme';

const DEFAULT_OPTIONS: { key: string; label: string }[] = [
  { key: 'name', label: 'A–Z' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'practiceCount', label: 'Practice' },
  { key: 'createdAt', label: 'Date added' },
];

type Props = {
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string, dir: SortDir) => void;
  options?: { key: string; label: string }[];
};

export function SortDropdown({ sortKey, sortDir, onSort, options = DEFAULT_OPTIONS }: Props) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.key === sortKey)?.label ?? options[0]?.label;
  const dirArrow = sortDir === 'asc' ? '↑' : '↓';

  const handlePill = (key: string) => {
    if (key === sortKey) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.trigger, { opacity: pressed ? 0.7 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={styles.triggerText}>
          Sort: <Text style={styles.triggerActive}>{currentLabel} {dirArrow}</Text>
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={C.accent}
        />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          <View style={styles.pillGrid}>
            {options.map(({ key, label }) => {
              const active = key === sortKey;
              return (
                <Pressable
                  key={key}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  style={({ pressed }) => [
                    styles.pill,
                    active && styles.pillActive,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => handlePill(key)}
                >
                  <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
                    {label}{active ? ` ${dirArrow}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
  },
  triggerText: {
    fontSize: 15,
    color: C.textSecondary,
  },
  triggerActive: {
    color: C.accent,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    marginTop: 4,
    padding: 12,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.chip,
    borderWidth: 0.5,
    borderColor: '#3C3C43',
  },
  pillActive: {
    backgroundColor: C.accentDark,
    borderColor: C.accent,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.textSecondary,
  },
  pillLabelActive: {
    color: C.textPrimary,
  },
});
