import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { MotionFrame } from '@/types/Move';

export function useMotionRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [frames, setFrames] = useState<MotionFrame[] | null>(null);

  const subscription = useRef<{ remove: () => void } | null>(null);
  const autoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collectedRef = useRef<MotionFrame[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    subscription.current?.remove();
    subscription.current = null;
    setIsRecording(false);
    setFrames([...collectedRef.current]);
  }, []);

  const start = useCallback(async () => {
    const available = await DeviceMotion.isAvailableAsync();
    if (!available) {
      Alert.alert('Not supported', 'Motion tracking is not available on this device.');
      return;
    }
    const { granted } = await DeviceMotion.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission required', 'Motion access is needed to record lead hand data.');
      return;
    }

    collectedRef.current = [];
    startTimeRef.current = Date.now();
    DeviceMotion.setUpdateInterval(33); // ~30 Hz; Android 12+ will be capped at 200ms by the OS

    subscription.current = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation || startTimeRef.current === null) return;
      collectedRef.current.push({
        t: Date.now() - startTimeRef.current,
        alpha: rotation.alpha ?? 0,
        beta: rotation.beta ?? 0,
        gamma: rotation.gamma ?? 0,
      });
    });

    setIsRecording(true);
    autoStopTimer.current = setTimeout(stop, 30_000);
  }, [stop]);

  // Seed existing frames (used in edit screen to pre-load saved motion data)
  const seed = useCallback((f: MotionFrame[] | null) => {
    setFrames(f);
  }, []);

  const clear = useCallback(() => {
    setFrames(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
      subscription.current?.remove();
    };
  }, []);

  return { isRecording, frames, start, stop, seed, clear };
}
