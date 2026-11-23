import { useState } from 'react';
import type { Memory, Surprise } from '../lib/types.js';
import { photoSrc } from '../lib/api.js';
import { audio } from '../lib/audio.js';
import { SceneHead, Modal } from './scene-head.js';
import styles from './scenes.module.css';

/**
 * Scene 05 — floating polaroid memory gallery with a lightbox.
 */
export function MemoriesScene({ surprise }: { surprise: Surprise }) {
  const [active, setActive] = useState<Memory | null>(null);
  const memories = surprise.memories || [];
  return (
    <section className={`${styles.scene} ${styles.bgNight}`}>
      <SceneHead
        eyebrow="Scene · Memories"
        title={<>Our <em>memories</em></>}
        sub="Every picture holds a little piece of us."
      />
      {memories.length === 0 ? (
        <p className={styles.empty}>Memories are being developed…</p>
      ) : (
        <div className={styles.memoryWall}>
          {memories.map((m, i) => (
            <button
              type="button"
              key={m.id}
              className={styles.polaroid}
              style={{ ['--tilt' as any]: `${((i * 37) % 9) - 4}deg`, ['--delay' as any]: `${i * -1.3}s` }}
              onClick={() => {
                audio.sfx('pop');
                setActive(m);
              }}
            >
              <img className={styles.polaroidImg} src={photoSrc(m.photoUrl)} alt={m.caption} loading="lazy" />
              <div className={styles.polaroidCap}>{m.caption}</div>
              {m.date && <div className={styles.polaroidDate}>{m.date}</div>}
            </button>
          ))}
        </div>
      )}
      {active && (
        <Modal onClose={() => setActive(null)} className={styles.lightbox}>
          <img src={photoSrc(active.photoUrl)} alt={active.caption} />
          <h3 className={styles.modalTitle}>{active.caption}</h3>
          {active.date && <div className={styles.polaroidDate} style={{ color: 'var(--gfx-gold)' }}>{active.date}</div>}
          {active.description && <p className={styles.modalText}>{active.description}</p>}
        </Modal>
      )}
    </section>
  );
}
