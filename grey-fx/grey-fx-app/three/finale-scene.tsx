import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from './fx.js';
import * as THREE from 'three';
import { House, Tree, Stars, PALETTE } from './props.js';
import { Snow } from './snow.js';

/** Golden rising particles. */
function GoldDust({ active }: { active: { current: number } }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 500;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 4;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = Math.random() * 8;
      p[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * 0.6;
      if (y > 9) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = active.current;
    ref.current.rotation.y += dt * 0.1;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={PALETTE.glow} size={0.08} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Timeline driver for the finale. */
function Director({
  lit,
  dust,
  snow,
  onStage,
}: {
  lit: { current: number };
  dust: { current: number };
  snow: { current: number };
  onStage: (s: number) => void;
}) {
  const start = useRef<number | null>(null);
  const stage = useRef(0);
  useFrame(({ clock, camera }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const t = clock.elapsedTime - start.current;
    // camera push towards tree
    const k = Math.min(1, t / 7);
    const e = 1 - Math.pow(1 - k, 3);
    camera.position.set(Math.sin(t * 0.08) * 0.8, 2.4 + (1 - e) * 4.5, 26 - e * 9);
    camera.lookAt(0, 4.6 - (1 - e) * 1.2, 0);
    lit.current = Math.min(1, Math.max(0, (t - 3) / 5));
    dust.current = Math.min(1, Math.max(0, (t - 6.5) / 2));
    snow.current = 0.6 + Math.min(1.6, Math.max(0, (t - 7.5) / 2) * 1.6);
    const s = t > 9.5 ? 3 : t > 7 ? 2 : t > 3 ? 1 : 0;
    if (s !== stage.current) {
      stage.current = s;
      onStage(s);
    }
  });
  return null;
}

/**
 * Cinematic finale (Scene 09): camera push, tree lights cascade, gold dust, heavier snow.
 * @param onStage called with timeline stage 0..3 (3 = show final message).
 */
export function FinaleScene({ onStage }: { onStage: (stage: number) => void }) {
  const lit = useRef(0);
  const dust = useRef(0);
  const snow = useRef(0.6);
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, 7, 22], fov: 45 }}>
      <color attach="background" args={[PALETTE.navy]} />
      <fog attach="fog" args={['#1a0d22', 14, 60]} />
      <hemisphereLight args={['#4a5a90', '#2a0a18', 0.5]} />
      <pointLight position={[0, 5, 3]} color={PALETTE.gold} intensity={16} distance={14} />
      <Stars count={900} radius={90} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#c9d1e3" roughness={1} />
      </mesh>
      <Tree position={[0, 0, 0]} scale={1.8} decorated lit={lit} />
      <House position={[-7, 0, -4]} rotation={0.5} seed={2} />
      <House position={[7, 0, -5]} rotation={-0.5} seed={5} />
      <House position={[-11, 0, -10]} rotation={0.3} seed={0} />
      <House position={[11, 0, -11]} rotation={-0.3} seed={3} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r = 14 + (i % 3) * 4;
        return <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r - 6]} scale={0.8 + (i % 4) * 0.2} />;
      })}
      <GoldDust active={dust} />
      <Snow count={2500} area={[40, 20, 40]} center={[0, 8, 0]} intensity={snow} />
      <Director lit={lit} dust={dust} snow={snow} onStage={onStage} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.3} luminanceThreshold={0.55} mipmapBlur />
        <Vignette offset={0.25} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
