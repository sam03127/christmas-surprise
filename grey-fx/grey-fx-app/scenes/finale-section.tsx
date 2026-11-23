import { lazy, Suspense, useEffect, useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { hasWebGL } from '../lib/use-reduced-motion.js';
import { CssSnow, Logo, GfxLinkButton } from '../ui/primitives.js';
import styles from './scenes.module.css';

const FinaleScene = lazy(() => import('../three/finale-scene.js').then((m) => ({ default: m.FinaleScene })));

const STAGE_TEXT = ['', 'The lights are waking up…', 'Something golden is coming…'];

/**
 * Scene 09 — cinematic finale with tree lighting and the final message.
 * @param showCta whether to show the "create your own" link (recipient mode).
 */
export function FinaleSection({ surprise, showCta = true }: { surprise: Surprise; showCta?: boolean }) {
  const [webgl] = useState(() => (typeof window !== 'undefined' ? hasWebGL() : true));
  const [stage, setStage] = useState(webgl ? 0 : 3);

  useEffect(() => {
    if (stage === 1) audio.sfx('sparkle');
    if (stage === 3) audio.sfx('chime');
  }, [stage]);

  return (
    <section className={`${styles.scene} ${styles.bgNight}`}>
      <div className={styles.finaleCanvas}>
        {webgl ? (
          <Suspense fallback={null}>
            <FinaleScene onStage={setStage} />
          </Suspense>
        ) : (
          <CssSnow />
        )}
      </div>
      <div className={styles.finaleOverlay}>
        {stage < 3 ? (
          <p key={stage} className={styles.finaleStage}>{STAGE_TEXT[stage]}</p>
        ) : (
          <>
            <h2 className={styles.finaleHeading}>{surprise.finalHeading || 'Merry Christmas, You Special Human!'}</h2>
            {surprise.finalMessage && <p className={styles.finaleMsg}>{surprise.finalMessage}</p>}
            <div className={styles.finaleSign}>{surprise.signature || `With love, ${surprise.senderName}`}</div>
            <div className={styles.finaleBrand}>
              <Logo />
              <span className={styles.finaleTagline}>Create emotions. Deliver surprises.</span>
              {showCta && (
                <GfxLinkButton to="/create" variant="ghost">
                  Create your own surprise
                </GfxLinkButton>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
