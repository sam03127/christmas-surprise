import type { ComponentType } from 'react';
import type { SceneKey, Surprise } from '../lib/types.js';
import { GiftsScene } from '../scenes/gifts-scene.js';
import { LetterScene } from '../scenes/letter-scene.js';
import { MemoriesScene } from '../scenes/memories-scene.js';
import { GlobeSection } from '../scenes/globe-section.js';
import { WishScene } from '../scenes/wish-scene.js';
import { ReasonsScene } from '../scenes/reasons-scene.js';
import { SecretScene } from '../scenes/secret-scene.js';
import { FinaleSection } from '../scenes/finale-section.js';

/** Map of scene key to its component. */
export const SCENE_COMPONENTS: Record<SceneKey, ComponentType<{ surprise: Surprise }>> = {
  gifts: GiftsScene,
  letter: LetterScene,
  memories: MemoriesScene,
  globe: GlobeSection,
  wish: WishScene,
  reasons: ReasonsScene,
  secret: SecretScene,
  finale: FinaleSection,
};

const ORDER: SceneKey[] = ['gifts', 'letter', 'memories', 'globe', 'wish', 'reasons', 'secret', 'finale'];

/**
 * Returns the scenes that should actually play, in order, skipping empty ones.
 * @param s the surprise.
 */
export function playableScenes(s: Surprise): SceneKey[] {
  const selected = new Set(s.scenes || []);
  return ORDER.filter((k) => {
    if (!selected.has(k)) return false;
    if (k === 'gifts') return (s.gifts || []).length > 0;
    if (k === 'memories') return (s.memories || []).length > 0;
    if (k === 'reasons') return (s.reasons || []).filter(Boolean).length > 0;
    if (k === 'letter') return Boolean(s.letter?.trim());
    if (k === 'secret') return s.hasSecret;
    return true;
  });
}
