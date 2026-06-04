import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Ionicons } from '@expo/vector-icons';
import { MotionFrame } from '@/types/Move';
import { C, RADIUS } from '@/constants/theme';

type Props = { frames: MotionFrame[]; fullScreen?: boolean };

const AMPLIFY = 10.0;
const REPLAY_SPEED = 0.5;
const IDENTITY_M4 = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

const toRad = (d: number) => d * (Math.PI / 180);

// Shortest-path angular delta, maps any value to [-180, 180].
const wrapDelta = (d: number) => ((d + 540) % 360) - 180;

function trailRGB(t: number): [number, number, number] {
  return [
    1.0   - 0.769 * t,
    0.267 + 0.243 * t,
    0.267 + 0.698 * t,
  ];
}

// ── Column-major 4×4 matrix helpers ──────────────────────────────────────────

function m4Persp(fovRad: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovRad * 0.5);
  const nf = 1 / (near - far);
  return new Float32Array([
    f, 0, 0, 0, 0, f, 0, 0,
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

// ─────────────────────────────────────────────────────────────────────────────

export function MotionTrailViewer({ frames, fullScreen = false }: Props) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [ready, setReady] = useState(false);

  const glCtx  = useRef<any>(null);
  const glProg = useRef<any>(null);
  const glBuf  = useRef<any>(null);
  const glBuf2 = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const nRef   = useRef(frames.length);
  const mounted = useRef(true);

  const az = useRef(0.35);
  const el = useRef(0.52);
  const zm = useRef(2.5);

  if (frames.length < 2) return null;

  const duration = frames[frames.length - 1].t - frames[0].t;

  // ── Pre-compute world-space positions from cumulative inter-frame deltas ───
  //
  // Using f.X - f0.X is WRONG: it can't handle beta wrap-around (±180°) or
  // accumulated rotations beyond 180°. The correct model accumulates
  // wrapDelta(f[i].X - f[i-1].X) so each tiny inter-frame jump is mapped to
  // its shortest-path equivalent before summing. This handles all wrap-arounds
  // on all three axes and any amount of total rotation.
  const { autoZoom, worldPos } = useMemo(() => {
    const n = frames.length;
    const pos = new Float32Array(n * 3); // [x,y,z, x,y,z, ...]
    pos[0] = pos[1] = pos[2] = 0; // first frame is always the origin

    for (let i = 1; i < n; i++) {
      const prev = frames[i - 1];
      const curr = frames[i];
      pos[i*3+0] = pos[(i-1)*3+0] + toRad(wrapDelta(curr.gamma - prev.gamma)) * AMPLIFY; // roll  → X
      pos[i*3+1] = pos[(i-1)*3+1] + toRad(wrapDelta(curr.beta  - prev.beta))  * AMPLIFY; // pitch → Y
      pos[i*3+2] = pos[(i-1)*3+2] + toRad(wrapDelta(curr.alpha - prev.alpha)) * AMPLIFY; // twist → Z
    }

    let maxExt = 0.001;
    for (let i = 0; i < n; i++) {
      const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
      maxExt = Math.max(maxExt, Math.sqrt(x*x + y*y + z*z));
    }
    const zoom = Math.max(0.3, Math.min(4, maxExt / Math.tan(toRad(70))));

    return { autoZoom: zoom, worldPos: pos };
  }, [frames]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { zm.current = autoZoom; }, [autoZoom]);

  // Build interleaved [x,y,z,r,g,b] for dot rendering from pre-computed positions.
  function buildVerts(count: number): Float32Array {
    const v = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0;
      v.set([worldPos[i*3], worldPos[i*3+1], worldPos[i*3+2], ...trailRGB(t)], i * 6);
    }
    return v;
  }

  // Build screen-space thick-line quads.
  // Returns { verts, vertCount } because outlier segments are skipped and
  // the actual vertex count must be passed to drawArrays.
  function buildThickVerts(
    count: number, mvp: Float32Array, W: number, H: number
  ): { verts: Float32Array; vertCount: number } {
    const halfPx = 2.5; // ±2.5px → 5px total line width

    const segs = count - 1;
    const out = new Float32Array(segs * 6 * 6); // worst-case allocation
    let vi = 0;

    // Project all world-space positions to NDC using the MVP matrix.
    const ndcX = new Float32Array(count);
    const ndcY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const wx = worldPos[i*3], wy = worldPos[i*3+1], wz = worldPos[i*3+2];
      const cx = mvp[0]*wx + mvp[4]*wy + mvp[8]*wz + mvp[12];
      const cy = mvp[1]*wx + mvp[5]*wy + mvp[9]*wz + mvp[13];
      const cw = mvp[3]*wx + mvp[7]*wy + mvp[11]*wz + mvp[15];
      ndcX[i] = cx / cw;
      ndcY[i] = cy / cw;
    }

    const push = (x: number, y: number, r: number, g: number, b: number) => {
      out[vi++] = x; out[vi++] = y; out[vi++] = 0;
      out[vi++] = r; out[vi++] = g; out[vi++] = b;
    };

    for (let i = 0; i < segs; i++) {
      const x0 = ndcX[i],   y0 = ndcY[i];
      const x1 = ndcX[i+1], y1 = ndcY[i+1];

      const t0 = i / (count - 1);
      const t1 = (i + 1) / (count - 1);
      const [r0, g0, b0] = trailRGB(t0);
      const [r1, g1, b1] = trailRGB(t1);

      // Compute aspect-correct perpendicular offset in NDC units.
      const dxW = (x1 - x0) * W;
      const dyH = (y1 - y0) * H;
      const len = Math.sqrt(dxW*dxW + dyH*dyH) || 0.001;
      const perpX = -dyH * halfPx * 2 / (len * W);
      const perpY =  dxW * halfPx * 2 / (len * H);

      push(x0 + perpX, y0 + perpY, r0, g0, b0);
      push(x0 - perpX, y0 - perpY, r0, g0, b0);
      push(x1 + perpX, y1 + perpY, r1, g1, b1);
      push(x0 - perpX, y0 - perpY, r0, g0, b0);
      push(x1 - perpX, y1 - perpY, r1, g1, b1);
      push(x1 + perpX, y1 + perpY, r1, g1, b1);
    }

    return { verts: out, vertCount: vi / 6 };
  }

  function draw(n?: number): void {
    const g = glCtx.current;
    if (!g || !glProg.current || !glBuf.current || !glBuf2.current) return;
    const count = n ?? nRef.current;
    if (count < 2) { g.endFrameEXP(); return; }

    g.clearColor(0.059, 0.059, 0.059, 1.0);
    g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);

    const mvp = m4Mul(
      m4Mul(m4Persp(toRad(60), 0.1, 100), m4Trans(0, 0, -zm.current)),
      m4Mul(m4RotX(el.current), m4RotY(az.current))
    );

    const uLoc  = g.getUniformLocation(glProg.current, 'uMVP');
    const pLoc  = g.getAttribLocation(glProg.current, 'aPos');
    const cLoc  = g.getAttribLocation(glProg.current, 'aCol');
    const STRIDE = 24;

    // Pass 1: thick line quads (already in NDC, identity MVP)
    const W = g.drawingBufferWidth;
    const H = g.drawingBufferHeight;
    const { verts, vertCount } = buildThickVerts(count, mvp, W, H);
    g.bindBuffer(g.ARRAY_BUFFER, glBuf2.current);
    g.bufferData(g.ARRAY_BUFFER, verts, g.DYNAMIC_DRAW);
    g.vertexAttribPointer(pLoc, 3, g.FLOAT, false, STRIDE, 0);
    g.enableVertexAttribArray(pLoc);
    g.vertexAttribPointer(cLoc, 3, g.FLOAT, false, STRIDE, 12);
    g.enableVertexAttribArray(cLoc);
    g.uniformMatrix4fv(uLoc, false, IDENTITY_M4);
    if (vertCount > 0) g.drawArrays(g.TRIANGLES, 0, vertCount);

    // Pass 2: start/end dots in 3D space
    const verts3D = buildVerts(count);
    g.bindBuffer(g.ARRAY_BUFFER, glBuf.current);
    g.bufferData(g.ARRAY_BUFFER, verts3D, g.DYNAMIC_DRAW);
    g.vertexAttribPointer(pLoc, 3, g.FLOAT, false, STRIDE, 0);
    g.enableVertexAttribArray(pLoc);
    g.vertexAttribPointer(cLoc, 3, g.FLOAT, false, STRIDE, 12);
    g.enableVertexAttribArray(cLoc);
    g.uniformMatrix4fv(uLoc, false, mvp);
    g.drawArrays(g.POINTS, 0, 1);
    g.drawArrays(g.POINTS, count - 1, 1);

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
      attribute vec4 aPos; attribute vec4 aCol;
      uniform mat4 uMVP;   varying vec4 vCol;
      void main() { gl_Position = uMVP * aPos; gl_PointSize = 12.0; vCol = aCol; }
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
    glBuf2.current = g.createBuffer();
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ready) draw(nRef.current);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReplay = useCallback(() => {
    if (isReplaying) return;
    setIsReplaying(true);
    nRef.current = 1;
    draw(1);

    const startWall = performance.now();
    const tOffset = frames[0].t;
    const total = frames.length;

    const tick = () => {
      const elapsed = (performance.now() - startWall) * REPLAY_SPEED;
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

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        az.current += g.dx * 0.0005;
        el.current  = Math.max(-1.4, Math.min(1.4, el.current - g.dy * 0.0005));
        draw();
      },
    })
  ).current;

  // ── Full-screen layout ────────────────────────────────────────────────────
  if (fullScreen) {
    return (
      <View style={styles.fullRoot} {...pan.panHandlers}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        {!ready && (
          <View style={styles.loading}>
            <Text style={styles.loadingTxt}>Loading 3D viewer…</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Pressable
            style={({ pressed }) => [styles.replayBtn, { opacity: pressed || isReplaying ? 0.6 : 1 }]}
            android_ripple={{ color: 'transparent' }}
            onPress={handleReplay}
            disabled={isReplaying}
          >
            <Ionicons name="play" size={13} color={C.accent} />
            <Text style={styles.replayTxt}>{isReplaying ? 'Playing…' : 'Replay'}</Text>
          </Pressable>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#FF4444' }]} />
              <Text style={styles.legendTxt}>Start</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendTxt}>End</Text>
            </View>
            <Text style={[styles.axisHint, { marginLeft: 'auto' as any }]}>← Roll  ↑ Pitch  ⊙ Twist</Text>
          </View>
          <Text style={styles.sub}>
            {frames.length} frames · {(duration / 1000).toFixed(1)}s · Drag to orbit
          </Text>
        </View>
      </View>
    );
  }

  // ── Card layout (default) ────────────────────────────────────────────────
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Motion Trail — 3D</Text>
          <Text style={styles.sub}>
            {frames.length} frames · {(duration / 1000).toFixed(1)}s · Drag to orbit
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.replayBtn, { opacity: pressed || isReplaying ? 0.6 : 1 }]}
          android_ripple={{ color: 'transparent' }}
          onPress={handleReplay}
          disabled={isReplaying}
        >
          <Ionicons name="play" size={13} color={C.accent} />
          <Text style={styles.replayTxt}>{isReplaying ? 'Playing…' : 'Replay'}</Text>
        </Pressable>
      </View>
      <View style={styles.canvas} {...pan.panHandlers}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        {!ready && (
          <View style={styles.loading}>
            <Text style={styles.loadingTxt}>Loading 3D viewer…</Text>
          </View>
        )}
      </View>
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
  fullRoot: { flex: 1, backgroundColor: C.bg },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 40, gap: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: { backgroundColor: C.surface, borderRadius: RADIUS.card, overflow: 'hidden' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, paddingBottom: 10,
  },
  title: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  canvas: {
    height: 300, marginHorizontal: 14,
    borderRadius: RADIUS.control, backgroundColor: C.bg, overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, paddingTop: 10,
  },
  sub: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
  replayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: C.border, borderRadius: RADIUS.badge, alignSelf: 'flex-start',
  },
  replayTxt: { fontSize: 12, fontWeight: '600', color: C.accent },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg,
  },
  loadingTxt: { fontSize: 13, color: C.textSecondary },
  legendRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, color: C.textSecondary },
  axisHint:  { fontSize: 11, color: C.textSecondary },
});
