import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Ionicons } from '@expo/vector-icons';
import { MotionFrame } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = { frames: MotionFrame[] };

// Visually amplify the orientation deltas so small wrist movements
// (5–15°) are clearly visible in the 3D scene.
const AMPLIFY = 5.0;

const toRad = (d: number) => d * (Math.PI / 180);

// Keep alpha deltas in [-180, 180] to handle the 0°/360° wrap.
const wrapDelta = (d: number) => ((d + 540) % 360) - 180;

// Red (#FF4444) → Blue (#3B82F6) gradient for t ∈ [0, 1].
function trailRGB(t: number): [number, number, number] {
  return [
    1.0   - 0.769 * t,   // R: 1.0   → 0.231
    0.267 + 0.243 * t,   // G: 0.267 → 0.510
    0.267 + 0.698 * t,   // B: 0.267 → 0.965
  ];
}

// ── Column-major 4×4 matrix helpers for WebGL ──────────────────────────────

function m4Persp(fovRad: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovRad * 0.5);
  const nf = 1 / (near - far);
  return new Float32Array([
    f, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function m4RotY(a: number): Float32Array {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function m4RotX(a: number): Float32Array {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function m4Trans(x: number, y: number, z: number): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function m4Mul(a: Float32Array, b: Float32Array): Float32Array {
  const o = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + row] * b[col * 4 + k];
      o[col * 4 + row] = s;
    }
  return o;
}

// ───────────────────────────────────────────────────────────────────────────

export function MotionTrailViewer({ frames }: Props) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [ready, setReady] = useState(false);

  const glCtx  = useRef<any>(null);
  const glProg = useRef<any>(null);
  const glBuf  = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const nRef   = useRef(frames.length); // currently visible frame count
  const mounted = useRef(true);

  // Orbit camera state (all in refs — no React re-render needed for GL)
  const az = useRef(0.35);  // azimuth  (~20°)
  const el = useRef(0.52);  // elevation (~30°)
  const zm = useRef(2.5);   // camera distance — overwritten by autoZoom

  if (frames.length < 2) return null;

  const f0 = frames[0];
  const duration = frames[frames.length - 1].t - f0.t;

  // Auto-zoom: set camera distance so the full trail fits within ~70% of the viewport.
  const autoZoom = useMemo(() => {
    let maxExt = 0.001;
    for (const f of frames) {
      const x = toRad(f.gamma - f0.gamma) * AMPLIFY;
      const y = toRad(f.beta  - f0.beta)  * AMPLIFY;
      const z = toRad(wrapDelta(f.alpha - f0.alpha)) * AMPLIFY;
      maxExt = Math.max(maxExt, Math.sqrt(x * x + y * y + z * z));
    }
    // tan(42°) ≈ 70% of the 60° FOV half-angle; clamp to sensible range
    return Math.max(0.4, Math.min(8, maxExt / Math.tan(toRad(42))));
  }, [frames]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync autoZoom into the ref whenever it changes
  useEffect(() => { zm.current = autoZoom; }, [autoZoom]);

  // Build interleaved [x, y, z, r, g, b, ...] for the first `n` frames.
  // x = roll delta, y = pitch delta, z = wrist-twist delta (all amplified)
  function buildVerts(n: number): Float32Array {
    const v = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const f = frames[i];
      const t = n > 1 ? i / (n - 1) : 0;
      v.set([
        toRad(f.gamma - f0.gamma)            * AMPLIFY,
        toRad(f.beta  - f0.beta)             * AMPLIFY,
        toRad(wrapDelta(f.alpha - f0.alpha)) * AMPLIFY,
        ...trailRGB(t),
      ], i * 6);
    }
    return v;
  }

  // Render the current scene into the GL context.
  // Uses only refs so it is safe to call from any closure.
  function draw(n?: number): void {
    const g = glCtx.current;
    if (!g || !glProg.current || !glBuf.current) return;
    const count = n ?? nRef.current;
    if (count < 2) { g.endFrameEXP(); return; }

    g.clearColor(0.059, 0.059, 0.059, 1.0);
    g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);

    // Upload vertex data
    g.bindBuffer(g.ARRAY_BUFFER, glBuf.current);
    g.bufferData(g.ARRAY_BUFFER, buildVerts(count), g.DYNAMIC_DRAW);

    // Build MVP: Perspective × Translate(back) × RotX(elevation) × RotY(azimuth)
    const mvp = m4Mul(
      m4Mul(m4Persp(toRad(60), 0.1, 100), m4Trans(0, 0, -zm.current)),
      m4Mul(m4RotX(el.current), m4RotY(az.current))
    );
    g.uniformMatrix4fv(g.getUniformLocation(glProg.current, 'uMVP'), false, mvp);

    const STRIDE = 24; // 6 floats × 4 bytes
    const posLoc = g.getAttribLocation(glProg.current, 'aPos');
    const colLoc = g.getAttribLocation(glProg.current, 'aCol');
    g.vertexAttribPointer(posLoc, 3, g.FLOAT, false, STRIDE, 0);
    g.enableVertexAttribArray(posLoc);
    g.vertexAttribPointer(colLoc, 3, g.FLOAT, false, STRIDE, 12);
    g.enableVertexAttribArray(colLoc);

    g.drawArrays(g.LINE_STRIP, 0, count);   // trail line
    g.drawArrays(g.POINTS, 0, 1);           // start dot (red)
    g.drawArrays(g.POINTS, count - 1, 1); // end dot (blue)

    g.endFrameEXP();
  }

  const onContextCreate = useCallback((g: any) => {
    g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
    g.enable(g.DEPTH_TEST);

    const compile = (type: number, src: string) => {
      const s = g.createShader(type);
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    };

    const prog = g.createProgram();
    g.attachShader(prog, compile(g.VERTEX_SHADER, `
      attribute vec4 aPos;
      attribute vec4 aCol;
      uniform mat4 uMVP;
      varying vec4 vCol;
      void main() {
        gl_Position = uMVP * aPos;
        gl_PointSize = 10.0;
        vCol = aCol;
      }
    `));
    g.attachShader(prog, compile(g.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec4 vCol;
      void main() { gl_FragColor = vCol; }
    `));
    g.linkProgram(prog);
    g.useProgram(prog);

    glCtx.current  = g;
    glProg.current = prog;
    glBuf.current  = g.createBuffer();
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw once the GL context is ready
  useEffect(() => {
    if (ready) draw(nRef.current);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time replay driven by actual recorded timestamps
  const handleReplay = useCallback(() => {
    if (isReplaying) return;
    setIsReplaying(true);
    nRef.current = 1;
    draw(1);

    const startWall = performance.now();
    const tOffset = f0.t;
    const total = frames.length;

    const tick = () => {
      const elapsed = performance.now() - startWall;

      // Binary search: last frame whose t is at or before elapsed
      let lo = 0, hi = total - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if ((frames[mid].t - tOffset) <= elapsed) lo = mid;
        else hi = mid - 1;
      }

      nRef.current = lo + 1;
      draw(lo + 1);

      if (lo < total - 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (mounted.current) setIsReplaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [isReplaying]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Orbit controls via PanResponder — created once, reads refs via closure
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        az.current += g.dx * 0.012;
        el.current  = Math.max(-1.4, Math.min(1.4, el.current - g.dy * 0.012));
        draw();
      },
    })
  ).current;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Motion Trail — 3D</Text>
          <Text style={styles.sub}>
            {frames.length} frames · {(duration / 1000).toFixed(1)}s · Drag to orbit
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.replayBtn,
            { opacity: pressed || isReplaying ? 0.6 : 1 },
          ]}
          android_ripple={{ color: 'transparent' }}
          onPress={handleReplay}
          disabled={isReplaying}
        >
          <Ionicons name="play" size={13} color={C.accent} />
          <Text style={styles.replayTxt}>{isReplaying ? 'Playing…' : 'Replay'}</Text>
        </Pressable>
      </View>

      {/* 3D canvas */}
      <View style={styles.canvas} {...pan.panHandlers}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        {!ready && (
          <View style={styles.loading}>
            <Text style={styles.loadingTxt}>Loading 3D viewer…</Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF4444' }]} />
            <Text style={styles.legendTxt}>Start</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendTxt}>End</Text>
          </View>
        </View>
        <Text style={styles.axisHint}>← Roll  ↑ Pitch  ⊙ Twist</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  sub:   { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.border,
    borderRadius: RADIUS.badge,
  },
  replayTxt: { fontSize: 12, fontWeight: '600', color: C.accent },
  canvas: {
    height: 300,
    marginHorizontal: 14,
    borderRadius: RADIUS.control,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  loadingTxt: { fontSize: 13, color: C.textSecondary },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 10,
  },
  legendRow: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, color: C.textSecondary },
  axisHint:  { fontSize: 11, color: C.textSecondary },
});
