import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, DepthOfField } from './fx.js';
import * as THREE from 'three';
import { House, Tree, StreetLamp, Cloud, Stars, PALETTE } from './props.js';
import { Sleigh } from './sleigh.js';
import { Snow } from './snow.js';

/** Camera keyframes for the cinematic opening (position, lookAt). */
const SHOTS: { t: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { t: 0, pos: [0, 16, 48], look: [0, 3, 0] }, // wide establishing shot
  { t: 5, pos: [10, 7, 24], look: [0, 2, 0] }, // drift towards village
  { t: 10, pos: [-6, 3.2, 12], look: [2, 2, 0] }, // reveal glowing houses
  { t: 15, pos: [-4, 5, 14], look: [6, 10, -6] }, // follow santa in the sky
  { t: 21, pos: [0, 2.2, 15], look: [0, 1.2, 0] }, // settle on main tree (tree framed above the welcome copy)
];

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Drives the camera along the keyframed path; afterwards adds gentle pointer parallax.
 */
function CinematicCamera({ reduced, finished }: { reduced: boolean; finished: { current: boolean } }) {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const end = SHOTS[SHOTS.length - 1];
    const t = reduced ? end.t : clock.elapsedTime - start.current;
    let i = 0;
    while (i < SHOTS.length - 2 && t > SHOTS[i + 1].t) i++;
    const a = SHOTS[i];
    const b = SHOTS[Math.min(i + 1, SHOTS.length - 1)];
    const k = t >= end.t ? 1 : smooth(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
    const from = t >= end.t ? end : a;
    const to = t >= end.t ? end : b;
    tmp.set(...from.pos).lerp(new THREE.Vector3(...to.pos), k);
    tmpLook.set(...from.look).lerp(new THREE.Vector3(...to.look), k);
    if (t >= end.t) {
      finished.current = true;
      tmp.x += pointer.x * 1.2;
      tmp.y += pointer.y * 0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.15;
    }
    camera.position.lerp(tmp, 0.06);
    look.current.lerp(tmpLook, 0.06);
    camera.lookAt(look.current);
  });
  return null;
}

/** Santa flying in a wide arc across the sky. */
function FlyingSanta() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * 0.09 + 0.35) % 1;
    const a = t * Math.PI * 2;
    const x = Math.cos(a) * 26;
    const z = Math.sin(a) * 14 - 8;
    const y = 10 + Math.sin(a * 2) * 1.6;
    ref.current.position.set(x, y, z);
    const nx = -Math.sin(a) * 26;
    const nz = Math.cos(a) * 14;
    ref.current.rotation.y = Math.atan2(-nz, nx);
    ref.current.rotation.z = Math.sin(a * 2) * 0.1;
  });
  return (
    <group ref={ref} scale={0.9}>
      <Sleigh />
    </group>
  );
}

/** Rolling snow ground with hills and distant mountains. */
function Landscape() {
  const ground = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 200, 80, 80);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const hill = dist > 18 ? Math.sin(x * 0.08) * Math.cos(y * 0.07) * 2.5 * Math.min(1, (dist - 18) / 20) : 0;
      p.setZ(i, hill + Math.sin(x * 0.4) * Math.cos(y * 0.3) * 0.08);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mountains = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 1.3 + Math.PI * 0.85;
        const r = 70 + (i % 3) * 8;
        return { p: [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number], h: 14 + ((i * 7) % 5) * 4, w: 12 + (i % 4) * 3 };
      }),
    []
  );
  return (
    <group>
      <mesh geometry={ground} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={'#cfd6e6'} roughness={1} />
      </mesh>
      {mountains.map((m, i) => (
        <group key={i} position={m.p}>
          <mesh position={[0, m.h / 2, 0]}>
            <coneGeometry args={[m.w, m.h, 7]} />
            <meshStandardMaterial color={'#1a2238'} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, m.h * 0.82, 0]}>
            <coneGeometry args={[m.w * 0.37, m.h * 0.37, 7]} />
            <meshStandardMaterial color={PALETTE.snow} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The village layout — houses ringed around the main tree, forest beyond. */
function Village({ lowPower }: { lowPower: boolean }) {
  const houses = useMemo(() => {
    const out: { p: [number, number, number]; r: number; s: number }[] = [];
    const n = lowPower ? 9 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const r = 8 + (i % 3) * 2.6;
      out.push({ p: [Math.cos(a) * r, 0, Math.sin(a) * r], r: -a - Math.PI / 2, s: 0.9 + (i % 3) * 0.12 });
    }
    return out;
  }, [lowPower]);
  const forest = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = [];
    const n = lowPower ? 50 : 110;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 17 + Math.random() * 28;
      out.push({ p: [Math.cos(a) * r, 0, Math.sin(a) * r], s: 0.7 + Math.random() * 0.9 });
    }
    return out;
  }, [lowPower]);
  const lamps = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return [Math.cos(a) * 5, 0, Math.sin(a) * 5] as [number, number, number];
    }),
    []
  );
  return (
    <group>
      <Tree position={[0, 0, 0]} scale={1.25} decorated />
      {houses.map((h, i) => (
        <House key={i} position={h.p} rotation={h.r} scale={h.s} seed={i} />
      ))}
      {forest.map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} />
      ))}
      {lamps.map((p, i) => (
        <StreetLamp key={i} position={p} />
      ))}
      {lamps.map((p, i) => (
        <pointLight key={`l${i}`} position={[p[0], 2.6, p[2]]} color="#ffb565" intensity={4} distance={7} decay={1.6} />
      ))}
    </group>
  );
}

/** Props for the village canvas. */
export type VillageSceneProps = {
  reduced?: boolean;
  /** Ref set to true once the opening camera move completes. */
  onFinishedRef?: { current: boolean };
};

/**
 * Full-screen cinematic 3D Christmas village (Scene 01).
 */
export function VillageScene({ reduced = false, onFinishedRef }: VillageSceneProps) {
  const finished = onFinishedRef || { current: false };
  const lowPower = typeof window !== 'undefined' && (window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4);
  return (
    <Canvas
      shadows={!lowPower}
      dpr={[1, lowPower ? 1.4 : 2]}
      camera={{ position: [0, 16, 48], fov: 45, near: 0.1, far: 400 }}
      gl={{ antialias: !lowPower, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={[PALETTE.navy]} />
      <fog attach="fog" args={['#1a1030', 22, 95]} />
      <hemisphereLight args={['#5a6aa0', '#3a1020', 0.55]} />
      <directionalLight
        position={[-20, 30, 10]}
        intensity={0.9}
        color="#b8c6ff"
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[0, 6, 0]} color={PALETTE.gold} intensity={14} distance={16} />
      {/* moon */}
      <mesh position={[-40, 38, -80]}>
        <sphereGeometry args={[4, 24, 24]} />
        <meshBasicMaterial color="#fff4dc" toneMapped={false} />
      </mesh>
      <Stars count={lowPower ? 600 : 1400} />
      <Landscape />
      <Village lowPower={lowPower} />
      <FlyingSanta />
      <Cloud position={[-30, 20, -30]} speed={0.6} scale={2.2} />
      <Cloud position={[10, 24, -40]} speed={0.4} scale={3} />
      <Cloud position={[30, 18, -20]} speed={0.5} scale={1.8} />
      <Snow count={lowPower ? 1400 : 3500} area={[70, 30, 70]} />
      <CinematicCamera reduced={reduced} finished={finished} />
      {!lowPower ? (
        <EffectComposer multisampling={0}>
          <DepthOfField focusDistance={0.02} focalLength={0.06} bokehScale={2.2} />
          <Bloom intensity={1.1} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.75} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.65} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
