import { useState } from 'react';
import type { Gift, Surprise } from '../lib/types.js';
import { photoSrc } from '../lib/api.js';
import { audio } from '../lib/audio.js';
import { CssSnow } from '../ui/primitives.js';
import { SceneHead, Modal } from './scene-head.js';
import styles from './scenes.module.css';

const WRAPS: Record<Gift['wrap'], { wrap: string; ribbon: string }> = {
  burgundy: { wrap: '#5A1728', ribbon: '#D9AE70' },
  emerald: { wrap: '#16432F', ribbon: '#F4D7A1' },
  gold: { wrap: '#C89B5E', ribbon: '#5A1728' },
  navy: { wrap: '#14203d', ribbon: '#D9AE70' },
};

/**
 * Scene 03 — interactive gift boxes that unwrap to reveal messages and photos.
 */
export function GiftsScene({ surprise }: { surprise: Surprise }) {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Gift | null>(null);
  const gifts = surprise.gifts || [];

  const open = (g: Gift) => {
    audio.sfx('paper');
    setOpened((s) => new Set(s).add(g.id));
    window.setTimeout(() => {
      audio.sfx('chime');
      setActive(g);
    }, 850);
  };

  return (
    <section className={`${styles.scene} ${styles.bgBurgundy}`}>
      <CssSnow count={30} />
      <SceneHead
        eyebrow="Scene · Gifts"
        title={<>Gifts wrapped <em>just for you</em></>}
        sub={`${gifts.length} little surprises are waiting, ${surprise.recipientName || 'you'}. Tap one to unwrap it.`}
      />
      {gifts.length === 0 ? (
        <p className={styles.empty}>The elves are still wrapping…</p>
      ) : (
        <div className={styles.giftGrid}>
          {gifts.map((g, i) => {
            const isOpen = opened.has(g.id);
            const w = WRAPS[g.wrap] || WRAPS.burgundy;
            return (
              <div key={g.id} className={styles.giftWrap}>
                <button
                  type="button"
                  className={`${styles.gift} ${isOpen ? styles.giftOpen : ''}`}
                  style={{ ['--wrap' as any]: w.wrap, ['--ribbon' as any]: w.ribbon, animationDelay: `${i * -0.7}s` }}
                  onClick={() => (isOpen ? setActive(g) : open(g))}
                  aria-label={isOpen ? `View ${g.title}` : `Unwrap gift ${i + 1}`}
                >
                  <span className={styles.giftGlow} />
                  <span className={styles.giftBox} />
                  <span className={styles.giftLid}>
                    <span className={styles.bow} />
                  </span>
                </button>
                {g.mystery && !isOpen ? (
                  <span className={styles.mysteryTag}>Mystery gift</span>
                ) : (
                  <span className={styles.giftLabel}>{isOpen || !g.mystery ? g.title || `Gift ${i + 1}` : ''}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {active && (
        <Modal onClose={() => setActive(null)}>
          {active.photoUrl && <img className={styles.modalPhoto} src={photoSrc(active.photoUrl)} alt={active.title} />}
          <h3 className={styles.modalTitle}>{active.title}</h3>
          <p className={styles.modalText}>{active.message}</p>
        </Modal>
      )}
    </section>
  );
}
