import { lazy, Suspense, useRef, useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { hasWebGL } from '../lib/use-reduced-motion.js';
import { GfxButton, CssSnow } from '../ui/primitives.js';
import { SceneHead } from './scene-head.js';
import styles from './scenes.module.css';

const GlobeScene = lazy(() => import('../three/globe-scene.js').then((m) => ({ default: m.GlobeScene })));

/**
 * Scene 06 — rotatable 3D snow globe; shaking it reveals a hidden message.
 */
export function GlobeSection({ surprise }: { surprise: Surprise }) {
  const shake = useRef(0.15);
  const [revealed, setRevealed] = useState(false);
  const [webgl] = useState(() => (typeof window !== 'undefined' ? hasWebGL() : true));

  const doShake = () => {
    shake.current = 3;
    audio.sfx('sparkle');
    window.setTimeout(() => setRevealed(true), 1400);
  };

  return (
    <section className={`${styles.scene} ${styles.bgNight}`}>
      {!webgl && <CssSnow />}
      <SceneHead
        eyebrow="Scene · Snow globe"
        title={<>The magic <em>snow globe</em></>}
        sub="Drag to turn it. Shake it to wake the magic inside."
      />
      <div className={styles.globeWrap} onDoubleClick={doShake}>
        {webgl ? (
          <Suspense fallback={<p className={styles.empty}>Polishing the glass…</p>}>
            <GlobeScene shake={shake} />
          </Suspense>
        ) : (
          <p className={styles.empty}>❄ A tiny village sleeps inside the glass ❄</p>
        )}
      </div>
      <div className={styles.globeActions}>
        <GfxButton onClick={doShake}>Shake the globe</GfxButton>
      </div>
      {revealed && <div className={styles.revealCard}>{surprise.globeMessage || 'You make every winter feel warm.'}</div>}
    </section>
  );
}
