import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from './props.js';

function Reindeer({ offset, nose = false }: { offset: number; nose?: boolean }) {
  const legs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!legs.current) return;
    const t = clock.elapsedTime * 8 + offset;
    legs.current.children.forEach((l, i) => {
      l.rotation.x = Math.sin(t + (i % 2) * Math.PI) * 0.6;
    });
  });
  const fur = '#6b4a32';
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.55, 4, 8]} />
        <meshStandardMaterial color={fur} roughness={0.9} />
      </mesh>
      <mesh position={[0.45, 0.25, 0]} rotation={[0, 0, -0.6]}>
        <capsuleGeometry args={[0.08, 0.25, 4, 6]} />
        <meshStandardMaterial color={fur} />
      </mesh>
      <mesh position={[0.6, 0.38, 0]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial color={fur} />
      </mesh>
      <mesh position={[0.73, 0.36, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        {nose ? (
          <meshStandardMaterial color="#ff3b3b" emissive="#ff2020" emissiveIntensity={6} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#2a1a14" />
        )}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.55, 0.58, s * 0.08]} rotation={[s * 0.3, 0, 0.3]}>
          <cylinderGeometry args={[0.012, 0.02, 0.3, 4]} />
          <meshStandardMaterial color="#d8c3a0" />
        </mesh>
      ))}
      <group ref={legs}>
        {[[-0.25, -0.1], [-0.25, 0.1], [0.25, -0.1], [0.25, 0.1]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.3, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 4]} />
            <meshStandardMaterial color="#4a3222" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Santa's sleigh pulled by reindeer (Rudolph leads). Positioned by parent.
 */
export const Sleigh = forwardRef<THREE.Group>(function Sleigh(_, ref) {
  return (
    <group ref={ref}>
      {/* sleigh body */}
      <group position={[-1.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.45, 0.7]} />
          <meshStandardMaterial color={PALETTE.burgundy} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[-0.45, 0.35, 0]}>
          <boxGeometry args={[0.25, 0.4, 0.7]} />
          <meshStandardMaterial color={PALETTE.burgundy} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.32, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.03, 6, 20, Math.PI]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.32, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.03, 6, 20, Math.PI]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* santa */}
        <mesh position={[-0.05, 0.45, 0]}>
          <sphereGeometry args={[0.28, 12, 10]} />
          <meshStandardMaterial color="#b3152a" />
        </mesh>
        <mesh position={[-0.05, 0.82, 0]}>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color="#f1c6a6" />
        </mesh>
        <mesh position={[0.02, 0.74, 0]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshStandardMaterial color={PALETTE.snow} />
        </mesh>
        <mesh position={[-0.08, 1.0, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.14, 0.32, 10]} />
          <meshStandardMaterial color="#b3152a" />
        </mesh>
        {/* gift sack */}
        <mesh position={[-0.35, 0.45, 0]}>
          <sphereGeometry args={[0.26, 10, 8]} />
          <meshStandardMaterial color="#8a6a3e" />
        </mesh>
        <pointLight color={PALETTE.glow} intensity={6} distance={6} />
      </group>
      {/* reins */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 2.2, 3]} />
        <meshBasicMaterial color={PALETTE.gold} />
      </mesh>
      <group position={[0.2, 0, 0]}>
        <group position={[0, 0, -0.35]}><Reindeer offset={0} /></group>
        <group position={[0, 0, 0.35]}><Reindeer offset={1} /></group>
        <group position={[1.1, 0, -0.35]}><Reindeer offset={2} /></group>
        <group position={[1.1, 0, 0.35]}><Reindeer offset={3} /></group>
        <group position={[2.2, 0, 0]}><Reindeer offset={4} nose /></group>
      </group>
    </group>
  );
});
