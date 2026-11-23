import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** GREY FX palette for 3D materials. */
export const PALETTE = {
  burgundy: '#5A1728',
  burgundyDeep: '#260812',
  navy: '#080F20',
  emerald: '#16432F',
  emeraldLight: '#1F5A40',
  gold: '#D9AE70',
  glow: '#F4D7A1',
  cream: '#FFF1DF',
  snow: '#E9EDF5',
};

const WALLS = ['#6B2333', '#3E2A2A', '#7A5A48', '#2F3B4E', '#5A1728', '#4A3328'];

/** Props for a snowy cottage. */
export type HouseProps = {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  seed?: number;
};

/**
 * Procedural snow-covered cottage with glowing windows and chimney.
 */
export function House({ position, rotation = 0, scale = 1, seed = 0 }: HouseProps) {
  const wall = WALLS[seed % WALLS.length];
  const w = 2 + (seed % 3) * 0.4;
  const d = 1.8 + ((seed * 7) % 3) * 0.3;
  const h = 1.5 + ((seed * 5) % 3) * 0.35;
  const roofGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 - 0.25, 0);
    shape.lineTo(0, h * 0.75);
    shape.lineTo(w / 2 + 0.25, 0);
    shape.lineTo(-w / 2 - 0.25, 0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: d + 0.4, bevelEnabled: false });
    g.translate(0, 0, -(d + 0.4) / 2);
    return g;
  }, [w, d, h]);
  const windows = useMemo(() => {
    const out: [number, number, number][] = [];
    const cols = w > 2.4 ? 2 : 1;
    for (let c = 0; c < cols; c++) {
      const x = cols === 1 ? 0 : (c - 0.5) * (w * 0.5);
      out.push([x, h * 0.55, d / 2 + 0.01]);
    }
    return out;
  }, [w, h, d]);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={wall} roughness={0.85} />
      </mesh>
      <mesh geometry={roofGeo} position={[0, h, 0]} castShadow>
        <meshStandardMaterial color={PALETTE.snow} roughness={0.95} />
      </mesh>
      {/* chimney */}
      <mesh position={[w * 0.25, h + h * 0.55, -d * 0.15]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#3a2420" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[w > 2.4 ? 0 : -w * 0.28, 0.45, d / 2 + 0.01]}>
        <planeGeometry args={[0.45, 0.9]} />
        <meshStandardMaterial color={PALETTE.burgundyDeep} />
      </mesh>
      {windows.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <planeGeometry args={[0.5, 0.45]} />
            <meshStandardMaterial
              color={PALETTE.glow}
              emissive={'#FFB75E'}
              emissiveIntensity={2.4}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.04, 0.45]} />
            <meshBasicMaterial color="#2a1a14" />
          </mesh>
        </group>
      ))}
      {/* side window */}
      <mesh position={[w / 2 + 0.01, h * 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.45, 0.4]} />
        <meshStandardMaterial color={PALETTE.glow} emissive={'#FFB75E'} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* string lights under eaves */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-w / 2 + (i + 0.5) * (w / 6), h - 0.05, d / 2 + 0.22]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial color={i % 2 ? PALETTE.gold : '#ff6a6a'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Props for a Christmas tree. */
export type TreeProps = {
  position: [number, number, number];
  scale?: number;
  decorated?: boolean;
  /** 0..1 — how many lights are lit (finale). */
  lit?: { current: number };
  star?: boolean;
};

/**
 * Snowy layered fir tree, optionally decorated with ornaments, lights and a star.
 */
export function Tree({ position, scale = 1, decorated = false, lit, star = false }: TreeProps) {
  const lights = useMemo(() => {
    if (!decorated) return [];
    const out: { p: [number, number, number]; c: string }[] = [];
    const colors = [PALETTE.gold, PALETTE.glow, '#ff7070', PALETTE.cream];
    for (let i = 0; i < 46; i++) {
      const t = i / 46;
      const y = 0.9 + t * 3.1;
      const r = (1 - t) * 1.35 + 0.12;
      const a = t * Math.PI * 9;
      out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], c: colors[i % colors.length] });
    }
    return out;
  }, [decorated]);
  const lightRefs = useRef<(THREE.Mesh | null)[]>([]);
  const starRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!decorated) return;
    const t = clock.elapsedTime;
    const k = lit ? lit.current : 1;
    lightRefs.current.forEach((m, i) => {
      if (!m) return;
      const on = i / lights.length < k;
      const twinkle = 0.75 + Math.sin(t * 3 + i * 1.7) * 0.25;
      m.scale.setScalar(on ? twinkle : 0.001);
    });
    if (starRef.current) {
      starRef.current.rotation.y = t * 0.6;
      const s = lit ? Math.min(1, Math.max(0, (k - 0.85) * 6.6)) : 1;
      starRef.current.scale.setScalar(0.001 + s);
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.7, 6]} />
        <meshStandardMaterial color="#3b2418" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <mesh position={[0, 1.1 + i * 0.85, 0]} castShadow>
            <coneGeometry args={[1.5 - i * 0.32, 1.5, 9]} />
            <meshStandardMaterial color={i % 2 ? PALETTE.emerald : PALETTE.emeraldLight} roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.62 + i * 0.85, 0]}>
            <coneGeometry args={[1.52 - i * 0.32, 0.38, 9, 1, true]} />
            <meshStandardMaterial color={PALETTE.snow} roughness={1} side={THREE.DoubleSide} flatShading />
          </mesh>
        </group>
      ))}
      {decorated &&
        lights.map((l, i) => (
          <mesh key={i} position={l.p} ref={(m) => (lightRefs.current[i] = m)}>
            <sphereGeometry args={[i % 5 === 0 ? 0.11 : 0.06, 8, 8]} />
            <meshStandardMaterial color={l.c} emissive={l.c} emissiveIntensity={3} toneMapped={false} />
          </mesh>
        ))}
      {(decorated || star) && (
        <mesh ref={starRef} position={[0, 4.35, 0]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color={PALETTE.glow} emissive={PALETTE.gold} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Victorian street lamp with warm glow.
 * @param position world position.
 */
export function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 6]} />
        <meshStandardMaterial color="#1b1b22" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color={PALETTE.glow} emissive="#FFC070" emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.68, 0]}>
        <coneGeometry args={[0.22, 0.2, 6]} />
        <meshStandardMaterial color="#1b1b22" />
      </mesh>
    </group>
  );
}

/**
 * Drifting soft cloud built from spheres.
 */
export function Cloud({ position, speed = 0.3, scale = 1 }: { position: [number, number, number]; speed?: number; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = ((position[0] + clock.elapsedTime * speed + 60) % 120) - 60;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {[[0, 0, 0, 1.6], [1.6, -0.2, 0.2, 1.2], [-1.5, -0.3, 0, 1.1], [0.6, 0.6, -0.3, 1.1]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#3a3550" transparent opacity={0.5} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Starfield points sphere.
 */
export function Stars({ count = 1200, radius = 120 }: { count?: number; radius?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random() * 0.5 + 0.5;
      const th = u * Math.PI * 2;
      const ph = Math.acos(2 * v - 1);
      pos[i * 3] = radius * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = Math.abs(radius * Math.cos(ph)) + 5;
      pos[i * 3 + 2] = radius * Math.sin(ph) * Math.sin(th);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={PALETTE.cream} size={0.5} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}
