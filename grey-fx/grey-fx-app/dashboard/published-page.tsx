import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CssSnow, Eyebrow, GfxButton, GfxLinkButton, StarMark } from '../ui/primitives.js';
import styles from './dashboard.module.css';

/**
 * Builds the public share URL for a surprise.
 * @param id surprise id.
 */
export function shareUrl(id: string) {
  return `${window.location.origin}/surprise/${id}`;
}

/**
 * Success screen after publishing, with copy-link and native share.
 */
export function PublishedPage() {
  const { id = '' } = useParams();
  const url = shareUrl(id);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.getElementById('share-link') as HTMLInputElement | null;
      el?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const share = async () => {
    try {
      await navigator.share({ title: 'A Christmas surprise for you 🎄', text: 'Someone made a little Christmas world just for you…', url });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className={styles.published}>
      <CssSnow />
      <div className={styles.publishedCard}>
        <StarMark className={styles.publishedStar} />
        <Eyebrow>Published</Eyebrow>
        <h1 className={styles.h1} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Your Christmas world is ready
        </h1>
        <p className={styles.lead}>Send this link — no account needed to open it. Any edits you make later go live instantly.</p>
        <div className={styles.linkBox}>
          <input id="share-link" className={styles.linkText} value={url} readOnly onFocus={(e) => e.target.select()} aria-label="Share link" />
          <GfxButton size="sm" onClick={copy}>
            {copied ? '✓ Copied' : 'Copy link'}
          </GfxButton>
        </div>
        <div className={styles.publishedActions}>
          {canShare && (
            <GfxButton variant="ghost" size="sm" onClick={share}>
              Share…
            </GfxButton>
          )}
          <GfxLinkButton to={`/surprise/${id}`} variant="ghost">
            Open surprise
          </GfxLinkButton>
          <GfxLinkButton to={`/create/${id}`} variant="ghost">
            Keep editing
          </GfxLinkButton>
        </div>
      </div>
    </div>
  );
}
