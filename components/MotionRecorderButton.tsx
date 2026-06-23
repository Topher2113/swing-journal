import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotionFrame } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = {
  isRecording: boolean;
  frames: MotionFrame[] | null;
  onStart: () => void;
  onStop: () => void;
  onDiscard: () => void;
};

export function MotionRecorderButton({ isRecording, frames, onStart, onStop, onDiscard }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isRecording) { setElapsed(0); return; }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const formatElapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (isRecording) {
    return (
      <View style={styles.card}>
        <View style={styles.recordingRow}>
          <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          <Text style={styles.recordingText}>Recording… {formatElapsed(elapsed)} / 0:30</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.stopBtn, { opacity: pressed ? 0.8 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={onStop}
        >
          <Ionicons name="stop" size={16} color={C.textPrimary} />
          <Text style={styles.stopBtnText}>Stop</Text>
        </Pressable>
      </View>
    );
  }

  if (frames !== null) {
    return (
      <View style={styles.card}>
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          <Text style={styles.doneText}>{frames.length} frames captured</Text>
        </View>
        <View style={styles.doneActions}>
          <Pressable
            style={({ pressed }) => [styles.reRecordBtn, { opacity: pressed ? 0.75 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={onStart}
          >
            <Ionicons name="refresh" size={14} color={C.accent} />
            <Text style={styles.reRecordText}>Re-record</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.discardBtn, { opacity: pressed ? 0.75 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={onDiscard}
          >
            <Text style={styles.discardText}>Discard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.hint}>Hold the phone in your lead hand and tap to record.</Text>
      <Pressable
        style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.85 : 1 }]}
        android_ripple={{ color: 'transparent' }}
        onPress={onStart}
      >
        <Ionicons name="radio-button-on" size={18} color={C.textPrimary} />
        <Text style={styles.startBtnText}>Record Motion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    padding: 14,
    gap: 12,
  },
  hint: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.accent,
    borderRadius: RADIUS.control,
    paddingVertical: 12,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 14,
    color: C.textPrimary,
    fontWeight: '500',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3C3C3E',
    borderRadius: RADIUS.control,
    paddingVertical: 10,
  },
  stopBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneText: {
    fontSize: 14,
    color: C.textPrimary,
    fontWeight: '500',
  },
  doneActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reRecordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.border,
    borderRadius: RADIUS.control,
    paddingVertical: 10,
  },
  reRecordText: {
    fontSize: 13,
    color: C.accent,
    fontWeight: '500',
  },
  discardBtn: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardText: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
