import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { MotionFrame } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = { frames: MotionFrame[] };

const SVG_SIZE = 280;
const PADDING = 24;
const INNER = SVG_SIZE - PADDING * 2;
const MAX_DRAW_SEGMENTS = 250; // downsample for performance

// Interpolate from red (#FF4444) → blue (#3B82F6) based on t ∈ [0,1]
function lerpColor(t: number): string {
  const r = Math.round(255 + (59 - 255) * t);
  const g = Math.round(68 + (130 - 68) * t);
  const b = Math.round(68 + (246 - 68) * t);
  return `rgb(${r},${g},${b})`;
}

export function MotionTrailViewer({ frames }: Props) {
  const [visibleCount, setVisibleCount] = useState<number>(frames.length);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (frames.length < 2) return null;

  // Compute bounding box with a minimum range so still recordings aren't a dot
  const gammas = frames.map((f) => f.gamma);
  const betas = frames.map((f) => f.beta);
  const minG = Math.min(...gammas), maxG = Math.max(...gammas);
  const minB = Math.min(...betas), maxB = Math.max(...betas);
  const rangeG = Math.max(maxG - minG, 30); // at least 30° range
  const rangeB = Math.max(maxB - minB, 30);
  const centerG = (minG + maxG) / 2;
  const centerB = (minB + maxB) / 2;

  const toX = (gamma: number) =>
    PADDING + ((gamma - centerG + rangeG / 2) / rangeG) * INNER;
  const toY = (beta: number) =>
    SVG_SIZE - PADDING - ((beta - centerB + rangeB / 2) / rangeB) * INNER;

  // Downsample visible frames for rendering
  const visible = frames.slice(0, visibleCount);
  const step = Math.max(1, Math.floor(visible.length / MAX_DRAW_SEGMENTS));
  const sampled = visible.filter((_, i) => i % step === 0 || i === visible.length - 1);

  const handleReplay = useCallback(() => {
    if (isReplaying) return;
    setIsReplaying(true);
    setVisibleCount(1);

    const totalDuration = 2500; // replay over 2.5 seconds
    const steps = frames.length;
    const stepMs = totalDuration / steps;

    let current = 1;
    const advance = () => {
      current += Math.max(1, Math.ceil(steps / (totalDuration / 16))); // ~60fps advance
      if (current >= steps) {
        setVisibleCount(steps);
        setIsReplaying(false);
        return;
      }
      setVisibleCount(current);
      replayTimer.current = setTimeout(advance, 16);
    };
    replayTimer.current = setTimeout(advance, stepMs);
  }, [isReplaying, frames.length]);

  // Cleanup replay timer on unmount
  useEffect(() => {
    return () => {
      if (replayTimer.current) clearTimeout(replayTimer.current);
    };
  }, []);

  const lastFrame = sampled[sampled.length - 1];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Motion Trail</Text>
          <Text style={styles.subtitle}>Pitch (beta) vs Roll (gamma) · {frames.length} frames</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.replayBtn, { opacity: pressed || isReplaying ? 0.6 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={handleReplay}
          disabled={isReplaying}
        >
          <Ionicons name="play" size={13} color={C.accent} />
          <Text style={styles.replayText}>Replay</Text>
        </Pressable>
      </View>

      <View style={styles.canvasContainer}>
        <Svg
          width="100%"
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        >
          {/* Center crosshairs */}
          <Line
            x1={SVG_SIZE / 2} y1={PADDING}
            x2={SVG_SIZE / 2} y2={SVG_SIZE - PADDING}
            stroke={C.border} strokeWidth={1}
          />
          <Line
            x1={PADDING} y1={SVG_SIZE / 2}
            x2={SVG_SIZE - PADDING} y2={SVG_SIZE / 2}
            stroke={C.border} strokeWidth={1}
          />

          {/* Motion trail — colored segments */}
          {sampled.slice(0, -1).map((frame, i) => {
            const next = sampled[i + 1];
            const t = i / (sampled.length - 1);
            return (
              <Line
                key={i}
                x1={toX(frame.gamma)} y1={toY(frame.beta)}
                x2={toX(next.gamma)} y2={toY(next.beta)}
                stroke={lerpColor(t)}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Start dot (red) */}
          <Circle
            cx={toX(sampled[0].gamma)}
            cy={toY(sampled[0].beta)}
            r={5}
            fill={lerpColor(0)}
          />

          {/* End dot (blue, visible when not replaying or at end) */}
          {lastFrame && (
            <Circle
              cx={toX(lastFrame.gamma)}
              cy={toY(lastFrame.beta)}
              r={5}
              fill={lerpColor(1)}
            />
          )}
        </Svg>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: lerpColor(0) }]} />
          <Text style={styles.legendText}>Start</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: lerpColor(1) }]} />
          <Text style={styles.legendText}>End</Text>
        </View>
        <Text style={styles.legendNote}>Drag to rotate · Zoom with pinch</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.border,
    borderRadius: RADIUS.badge,
  },
  replayText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.accent,
  },
  canvasContainer: {
    backgroundColor: C.bg,
    marginHorizontal: 14,
    borderRadius: RADIUS.control,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: C.textSecondary,
  },
  legendNote: {
    fontSize: 11,
    color: C.textSecondary,
    marginLeft: 'auto',
  },
});
