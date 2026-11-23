import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Props for GPU snowfall. */
export type SnowProps = {
  count?: number;
  area?: [number, number, number];
  center?: [number, number, number];
  size?: number;
  speed?: number;
  color?: string;
  /** Mutable intensity multiplier ref (0..n) — lets scenes intensify snowfall. */
  intensity?: { current: number };
};

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  uniform float uSize;
  uniform float uSpeed;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float fall = uTime * uSpeed * (0.6 + aSeed * 0.8);
    p.y = mod(p.y - fall, uHeight) - uHeight * 0.5;
    p.x += sin(uTime * 0.6 + aSeed * 12.0) * 0.35;
    p.z += cos(uTime * 0.5 + aSeed * 9.0) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed) * (30.0 / -mv.z);
    vAlpha = 0.45 + aSeed * 0.55;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

/**
 * GPU-animated snowfall using a points shader (no per-frame CPU work per flake).
 */
export function Snow({
  count = 2500,
  area = [60, 30, 60],
  center = [0, 10, 0],
  size = 2.2,
  speed = 1.2,
  color = '#E9EDF5',
  intensity,
}: SnowProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = Math.random() * area[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      seeds[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count, area[0], area[1], area[2]]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: area[1] },
      uSize: { value: size },
      uSpeed: { value: speed },
      uOpacity: { value: 1 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
      uColor: { value: new THREE.Color(color) },
    }),
    []
  );

  useFrame((_, dt) => {
    if (!mat.current) return;
    const k = intensity ? intensity.current : 1;
    mat.current.uniforms.uTime.value += dt * Math.max(0.4, k);
    mat.current.uniforms.uOpacity.value = Math.min(1, 0.35 + k * 0.65);
  });

  return (
    <points geometry={geo} position={center} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
