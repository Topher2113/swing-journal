import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { MotionFrame } from '@/types/Move';

// Maps any angular delta to [-180, 180] (shortest-path interpretation).
const wrapDelta = (d: number) => ((d + 540) % 360) - 180;

// Threshold for discarding hardware sensor spikes.
// At 30 fps this allows up to 60°/frame (~1800°/s) — faster than any wrist move.
// Hardware glitches are typically thousands of degrees per frame, well above this.
const MAX_DEG_PER_SEC = 1800;

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
    DeviceMotion.setUpdateInterval(33); // ~30 Hz; Android 12+ capped at 200ms by OS

    subscription.current = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation || startTimeRef.current === null) return;

      const t = Date.now() - startTimeRef.current;
      const alpha = rotation.alpha ?? 0;
      const beta  = rotation.beta  ?? 0;
      const gamma = rotation.gamma ?? 0;

      // Spike filter: discard frames where any axis moved faster than MAX_DEG_PER_SEC.
      // This eliminates sensor initialization artifacts and hardware glitches.
      if (collectedRef.current.length > 0) {
        const prev = collectedRef.current[collectedRef.current.length - 1];
        const dt = Math.max(t - prev.t, 1); // ms
        const threshold = MAX_DEG_PER_SEC * (dt / 1000); // degrees allowed in this interval

        const dAlpha = Math.abs(wrapDelta(alpha - prev.alpha));
        const dBeta  = Math.abs(wrapDelta(beta  - prev.beta));
        const dGamma = Math.abs(gamma - prev.gamma); // gamma is bounded ±90°, doesn't wrap

        if (dAlpha > threshold || dBeta > threshold || dGamma > threshold) return;
      }

      collectedRef.current.push({ t, alpha, beta, gamma });
    });

    setIsRecording(true);
    autoStopTimer.current = setTimeout(stop, 30_000);
  }, [stop]);

  const seed = useCallback((f: MotionFrame[] | null) => {
    setFrames(f);
  }, []);

  const clear = useCallback(() => {
    setFrames(null);
  }, []);

  useEffect(() => {
    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
      subscription.current?.remove();
    };
  }, []);

  return { isRecording, frames, start, stop, seed, clear };
}
