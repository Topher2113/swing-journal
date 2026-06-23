import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMove } from '@/hooks/useMove';
import { MotionTrailViewer } from '@/components/MotionTrailViewer';
import { useTheme } from '@/context/ThemeContext';
import { MOTION_TRACKING_ENABLED } from '@/constants/features';

export default function MotionTrailScreen() {
  const { colors: C } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { move } = useMove(id);

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
  }), [C]);

  if (!MOTION_TRACKING_ENABLED || !move?.motionData || move.motionData.length < 2) {
    return <View style={styles.root} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Motion Trail', headerBackTitle: 'Detail' }} />
      <View style={styles.root}>
        <MotionTrailViewer frames={move.motionData} fullScreen />
      </View>
    </>
  );
}
