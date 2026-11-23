import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from './fx.js';
import * as THREE from 'three';
import { House, Tree, PALETTE } from './props.js';
import { Snow } from './snow.js';

/** Props for the snow globe. */
export type GlobeSceneProps = {
  /** Mutable shake intensity, decays over time. */
  shake: { current: number };
};

function Globe({ shake }: GlobeSceneProps) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    shake.current = Math.max(0.15, shake.current - dt * 0.35);
    if (!group.current) return;
    const s = Math.max(0, shake.current - 0.15);
    group.current.rotation.z = Math.sin(clock.elapsedTime * 22) * 0.05 * s;
    group.current.position.x = Math.sin(clock.elapsedTime * 30) * 0.04 * s;
  });
  return (
    <group ref={group}>
      {/* glass */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <MeshTransmissionMaterial
          thickness={0.15}
          roughness={0.02}
          transmission={1}
          ior={1.25}
          chromaticAberration={0.03}
          backside={false}
          samples={6}
          resolution={512}
          color="#ffffff"
        />
      </mesh>
      {/* miniature world inside */}
      <group position={[0, 0.55, 0]} scale={0.32}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4.4, 40]} />
          <meshStandardMaterial color={PALETTE.snow} roughness={1} />
        </mesh>
        <Tree position={[0, 0, 0]} decorated scale={0.8} />
        <House position={[-2.2, 0, 0.8]} rotation={0.6} seed={1} scale={0.8} />
        <House position={[2.2, 0, 0.6]} rotation={-0.6} seed={3} scale={0.75} />
        <House position={[0.2, 0, -2.4]} rotation={0} seed={4} scale={0.7} />
        <Tree position={[-1.6, 0, -1.8]} scale={0.6} />
        <Tree position={[1.7, 0, -1.6]} scale={0.55} />
        <Tree position={[-0.8, 0, 2.6]} scale={0.45} />
      </group>
      <group position={[0, 1.6, 0]}>
        <Snow count={600} area={[2.4, 2.6, 2.4]} center={[0, 0, 0]} size={0.5} speed={0.35} intensity={shake} />
      </group>
      {/* base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.35, 1.6, 0.6, 48]} />
        <meshStandardMaterial color={PALETTE.burgundy} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <torusGeometry args={[1.36, 0.06, 12, 64]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <torusGeometry args={[1.6, 0.06, 12, 64]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Interactive 3D snow globe (Scene 06) — drag to rotate.
 */
export function GlobeScene({ shake }: GlobeSceneProps) {
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, 2.2, 6], fov: 40 }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 5, 4]} intensity={30} color={PALETTE.glow} />
      <pointLight position={[-4, 2, -2]} intensity={12} color="#8090ff" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color={PALETTE.glow} position={[3, 3, 3]} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#9fb0ff" position={[-4, 2, -2]} scale={2} />
        <Lightformer form="rect" intensity={0.8} color={PALETTE.burgundy} position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
      </Environment>
      <Globe shake={shake} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[0, 1.4, 0]}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate
        autoRotateSpeed={0.6}
      />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
