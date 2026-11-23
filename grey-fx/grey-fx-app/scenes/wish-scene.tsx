import { useMemo, useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { SceneHead } from './scene-head.js';
import styles from './scenes.module.css';

const STAR_POS = [
  [12, 30], [28, 70], [42, 22], [50, 55], [63, 18], [76, 62], [88, 32],
];

function StarSvg() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <path d="M32 2 L38 26 L62 32 L38 38 L32 62 L26 38 L2 32 L26 26 Z" fill="#F4D7A1" />
      <circle cx="32" cy="32" r="5" fill="#FFF1DF" />
    </svg>
  );
}

/**
 * Scene 07 — northern-lights night sky; clicking the main star reveals the wish.
 */
export function WishScene({ surprise }: { surprise: Surprise }) {
  const [picked, setPicked] = useState<number | null>(null);
  const field = useMemo(
    () => Array.from({ length: 90 }, (_, i) => ({ l: (i * 53) % 100, t: (i * 29) % 100, d: (i % 7) * 0.4 })),
    []
  );
  return (
    <section className={`${styles.scene} ${styles.bgNight}`}>
      <div className={styles.aurora} />
      <div className={styles.starField} aria-hidden>
        {field.map((s, i) => (
          <span key={i} className={styles.tinyStar} style={{ left: `${s.l}%`, top: `${s.t}%`, animationDelay: `${s.d}s` }} />
        ))}
        <span className={styles.shooting} />
        <span className={styles.shooting} />
      </div>
      <SceneHead
        eyebrow="Scene · Make a wish"
        title={<>Make a wish. <em>The magic is listening.</em></>}
        sub="Choose a glowing star."
      />
      <div className={styles.wishStars}>
        {STAR_POS.map(([x, y], i) => (
          <button
            key={i}
            type="button"
            className={`${styles.wishStar} ${i === 3 ? styles.wishStarMain : ''} ${picked === i ? styles.wishPicked : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`Wish star ${i + 1}`}
            onClick={() => {
              audio.sfx('sparkle');
              setPicked(i);
            }}
          >
            <StarSvg />
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className={styles.revealCard} key={picked}>
          {surprise.wish || 'I wish for every one of your Christmases to be this magical.'}
        </div>
      )}
    </section>
  );
}
