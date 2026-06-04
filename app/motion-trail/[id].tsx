import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMove } from '@/hooks/useMove';
import { MotionTrailViewer } from '@/components/MotionTrailViewer';
import { C } from '@/constants/theme';

export default function MotionTrailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { move } = useMove(id);

  if (!move?.motionData || move.motionData.length < 2) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Motion Trail', headerBackTitle: 'Detail' }} />
      <View style={styles.root}>
        <MotionTrailViewer frames={move.motionData} fullScreen />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
