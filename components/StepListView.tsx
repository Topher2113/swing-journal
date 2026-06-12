import { StyleSheet, Text, View } from 'react-native';
import { LineDanceStep } from '@/types/LineDance';
import { C, RADIUS } from '@/constants/theme';

type Props = { steps: LineDanceStep[] };

export function StepListView({ steps }: Props) {
  if (steps.length === 0) return null;
  return (
    <View style={styles.container}>
      {steps.map((step) => (
        <View key={step.order} style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{step.order}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{step.name}</Text>
            {step.description ? (
              <Text style={styles.description}>{step.description}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 12,
    gap: 12,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  description: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
});
