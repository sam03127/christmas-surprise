import { useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { SceneHead } from './scene-head.js';
import { useTypewriter } from './use-typewriter.js';
import styles from './scenes.module.css';

/**
 * Scene 04 — wax-sealed envelope that opens to a typewritten handwritten letter.
 */
export function LetterScene({ surprise }: { surprise: Surprise }) {
  const [stage, setStage] = useState<'sealed' | 'opening' | 'reading'>('sealed');
  const text = surprise.letter || 'My dearest,\n\nMerry Christmas.';
  const { visible, done, skip } = useTypewriter(text, stage === 'reading', 32);
  const initial = (surprise.senderName || 'G').trim().charAt(0).toUpperCase();

  const open = () => {
    if (stage !== 'sealed') return;
    audio.sfx('seal');
    setStage('opening');
    window.setTimeout(() => audio.sfx('paper'), 600);
    window.setTimeout(() => setStage('reading'), 2400);
  };

  return (
    <section className={`${styles.scene} ${styles.bgCandle}`}>
      <span className={styles.candle} style={{ left: '8%' }} />
      <span className={styles.candle} style={{ right: '9%', height: 110 }} />
      <SceneHead
        eyebrow="Scene · A letter"
        title={<>A letter <em>from the heart</em></>}
        sub={stage === 'sealed' ? 'Break the wax seal to read it.' : undefined}
      />
      {stage !== 'reading' ? (
        <div className={`${styles.envelopeStage} ${stage === 'opening' ? styles.envOpen : ''}`}>
          <button type="button" className={styles.envelope} onClick={open} aria-label="Open the envelope">
            <span className={styles.envBack} />
            <span className={styles.paper} />
            <span className={styles.envFront} />
            <span className={styles.envFlap} />
            <span className={styles.seal}>{initial}</span>
            <span className={styles.envTo}>For {surprise.recipientName || 'you'}</span>
          </button>
        </div>
      ) : (
        <article className={styles.letterSheet} onClick={skip}>
          <div className={styles.letterHand}>
            {visible}
            {!done && <span className={styles.caret} />}
          </div>
          {done && <div className={styles.letterSign}>— {surprise.signature || surprise.senderName}</div>}
        </article>
      )}
    </section>
  );
}
