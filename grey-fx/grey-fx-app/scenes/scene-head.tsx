import type { ReactNode } from 'react';
import { Eyebrow } from '../ui/primitives.js';
import styles from './scenes.module.css';

/**
 * Shared scene heading (eyebrow, serif title, subtitle).
 */
export function SceneHead({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className={styles.head}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={styles.title}>{title}</h2>
      {sub && <p className={styles.sub}>{sub}</p>}
      <div className={styles.goldLine} />
    </header>
  );
}

/**
 * Accessible modal dialog.
 */
export function Modal({ onClose, children, className = '' }: { onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className={styles.modalBack} onClick={onClose} role="dialog" aria-modal="true">
      <div className={`${styles.modal} ${className}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
