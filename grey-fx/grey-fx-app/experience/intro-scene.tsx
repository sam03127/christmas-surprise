import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion, hasWebGL } from '../lib/use-reduced-motion.js';
import { audio } from '../lib/audio.js';
import { CssSnow, Eyebrow, GfxButton } from '../ui/primitives.js';
import styles from './experience.module.css';

const VillageScene = lazy(() => import('../three/village-scene.js').then((m) => ({ default: m.VillageScene })));

/** Props for the cinematic intro. */
export type IntroSceneProps = {
  /** Optional line above the title (e.g. "For Emma"). */
  forLine?: string;
  /** Main welcome text. */
  title?: string;
  cta?: string;
  onEnter: () => void;
  /** Show the music opt-in checkbox. */
  musicOptIn?: boolean;
};

/**
 * Scene 01 — the magical 3D Christmas village with the GREY FX welcome screen.
 * The welcome copy fades in once the opening camera move has played.
 */
export function IntroScene({
  forLine,
  title = 'Some surprises are more special when they come from the heart.',
  cta = 'Enter your Christmas world',
  onEnter,
  musicOptIn = true,
}: IntroSceneProps) {
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [show, setShow] = useState(false);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), reduced || !webgl ? 300 : 17000);
    return () => window.clearTimeout(id);
  }, [reduced, webgl]);

  const enter = () => {
    if (musicOptIn && music) audio.enable();
    audio.sfx('whoosh');
    onEnter();
  };

  return (
    <section className={styles.intro}>
      <div className={styles.canvas}>
        {webgl ? (
          <Suspense fallback={<CssSnow />}>
            <VillageScene reduced={reduced} />
          </Suspense>
        ) : (
          <CssSnow />
        )}
      </div>
      {!show && (
        <div className={styles.skip}>
          <GfxButton variant="ghost" size="sm" onClick={() => setShow(true)}>
            Skip intro
          </GfxButton>
        </div>
      )}
      <div className={styles.introOverlay}>
        <div className={`${styles.reveal} ${show ? styles.revealOn : ''}`}>
          {forLine ? <div className={styles.introFor}>{forLine}</div> : <Eyebrow>GREY FX · Christmas Digital Surprise</Eyebrow>}
          <h1 className={styles.introTitle}>{title}</h1>
          <GfxButton onClick={enter} tabIndex={show ? 0 : -1}>
            {cta}
          </GfxButton>
          {musicOptIn && (
            <div>
              <label className={styles.musicToggle}>
                <input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} />
                Play Christmas music
              </label>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
