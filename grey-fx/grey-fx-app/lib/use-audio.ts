import { useSyncExternalStore } from 'react';
import { audio } from './audio.js';

let snapshot = audio.state;
audio.subscribe(() => {
  snapshot = audio.state;
});

/**
 * Subscribes a component to the audio engine state.
 * @returns current muted/volume/track state.
 */
export function useAudio() {
  return useSyncExternalStore(
    (cb) => audio.subscribe(cb),
    () => snapshot,
    () => snapshot
  );
}
