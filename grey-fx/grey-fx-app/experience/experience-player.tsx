import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { GfxButton, Logo } from '../ui/primitives.js';
import { AudioControl } from '../ui/audio-control.js';
import { IntroScene } from './intro-scene.js';
import { WelcomeScene } from './welcome-scene.js';
import { SCENE_COMPONENTS, playableScenes } from './scene-registry.js';
import styles from './experience.module.css';

/** Props for the recipient player. */
export type ExperiencePlayerProps = {
  surprise: Surprise;
  /** Show the preview banner linking back to the editor. */
  previewOf?: string;
};

/**
 * Plays a full Christmas surprise: village intro → welcome → selected scenes → finale.
 */
export function ExperiencePlayer({ surprise, previewOf }: ExperiencePlayerProps) {
  const scenes = useMemo(() => playableScenes(surprise), [surprise]);
  // -2 = intro, -1 = welcome, 0..n = scenes
  const [step, setStep] = useState(-2);

  useEffect(() => {
    audio.setTrack(surprise.music || 'silent-night');
  }, [surprise.music]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const go = (n: number) => {
    audio.sfx('whoosh');
    setStep(Math.max(-1, Math.min(scenes.length - 1, n)));
  };

  const Scene = step >= 0 ? SCENE_COMPONENTS[scenes[step]] : null;
  const isLast = step === scenes.length - 1;

  return (
    <div className={styles.root}>
      <div className={styles.topbar}>
        <Logo />
        {step >= -1 && (
          <nav className={styles.dots} aria-label="Scenes">
            {[-1, ...scenes.map((_, i) => i)].map((i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                aria-label={i === -1 ? 'Welcome' : `Scene ${i + 1}`}
                onClick={() => go(i)}
              />
            ))}
          </nav>
        )}
      </div>
      {previewOf && (
        <Link to={`/create/${previewOf}`} className={styles.previewBanner}>
          Preview mode · Back to editor
        </Link>
      )}

      <div key={step} className={step === -2 ? undefined : styles.stage}>
        {step === -2 && (
          <IntroScene
            forLine={`For ${surprise.recipientName || 'you'}, from ${surprise.senderName || 'someone special'}`}
            onEnter={() => setStep(-1)}
          />
        )}
        {step === -1 && <WelcomeScene surprise={surprise} onBegin={() => go(0)} />}
        {Scene && <Scene surprise={surprise} />}
      </div>

      {step >= 0 && (
        <div className={styles.nav}>
          <GfxButton variant="ghost" size="sm" onClick={() => go(step - 1)}>
            ← Back
          </GfxButton>
          {!isLast && (
            <GfxButton size="sm" onClick={() => go(step + 1)}>
              Next →
            </GfxButton>
          )}
        </div>
      )}
      <AudioControl />
    </div>
  );
}
