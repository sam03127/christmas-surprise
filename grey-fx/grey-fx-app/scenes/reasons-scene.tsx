import { useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { CssSnow } from '../ui/primitives.js';
import { SceneHead } from './scene-head.js';
import styles from './scenes.module.css';

const FRIEND_ICONS = ['🎄', '⛄', '🦌', '🍪', '🧦', '🔔', '🎁', '⭐'];

/**
 * Scene 08 — flip cards revealing reasons why the recipient is special.
 * Romantic uses hearts, friendship uses collectible cards.
 */
export function ReasonsScene({ surprise }: { surprise: Surprise }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const romantic = surprise.experience === 'romantic';
  const reasons = (surprise.reasons || []).filter(Boolean);
  return (
    <section className={`${styles.scene} ${romantic ? styles.bgBurgundy : styles.bgEmerald} ${romantic ? '' : styles.friendship}`}>
      <CssSnow count={25} />
      <SceneHead
        eyebrow="Scene · Reasons"
        title={<>Reasons why <em>you're special</em></>}
        sub={`${flipped.size} of ${reasons.length} revealed — tap each ${romantic ? 'heart' : 'card'}.`}
      />
      <div className={styles.reasonGrid}>
        {reasons.map((r, i) => (
          <button
            type="button"
            key={i}
            className={`${styles.reason} ${flipped.has(i) ? styles.reasonFlipped : ''}`}
            style={{ ['--delay' as any]: `${i * -0.9}s` }}
            onClick={() => {
              audio.sfx('pop');
              setFlipped((s) => new Set(s).add(i));
            }}
            aria-label={`Reveal reason ${i + 1}`}
          >
            <span className={styles.reasonInner}>
              <span className={styles.reasonFace}>
                <span className={styles.reasonIcon}>{romantic ? '❤' : FRIEND_ICONS[i % FRIEND_ICONS.length]}</span>
                <span className={styles.reasonNum}>Reason {String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className={styles.reasonBack}>{r}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
