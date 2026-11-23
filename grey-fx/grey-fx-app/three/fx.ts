import type { ComponentType, ReactNode } from 'react';
// @react-three/postprocessing ships extensionless re-exports in its .d.ts, which
// NodeNext resolution cannot follow. Runtime is fine — we re-type the pieces we use.
// @ts-ignore
import * as PP from '@react-three/postprocessing';

type AnyProps = Record<string, unknown> & { children?: ReactNode };

/** Post-processing composer. */
export const EffectComposer = (PP as any).EffectComposer as ComponentType<AnyProps>;
/** Bloom glow effect. */
export const Bloom = (PP as any).Bloom as ComponentType<AnyProps>;
/** Vignette effect. */
export const Vignette = (PP as any).Vignette as ComponentType<AnyProps>;
/** Depth of field effect. */
export const DepthOfField = (PP as any).DepthOfField as ComponentType<AnyProps>;
