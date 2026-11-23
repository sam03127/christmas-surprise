import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Surprise } from '../lib/types.js';
import { api, listOwnedIds } from '../lib/api.js';
import { Eyebrow, GfxButton, GfxLinkButton, Logo } from '../ui/primitives.js';
import { shareUrl } from './published-page.js';
import styles from './dashboard.module.css';

/**
 * Lists surprises created in this browser.
 */
export function MySurprisesPage() {
  const [items, setItems] = useState<Surprise[] | null>(null);

  useEffect(() => {
    Promise.all(listOwnedIds().map((id) => api.get(id).catch(() => null))).then((list) =>
      setItems(list.filter(Boolean) as Surprise[])
    );
  }, []);

  return (
    <div className={styles.list}>
      <div style={{ position: 'fixed', top: '1rem', left: 'clamp(1rem,4vw,2.5rem)' }}>
        <Logo />
      </div>
      <div className={styles.listInner}>
        <Eyebrow>Creator studio</Eyebrow>
        <h1 className={styles.h1}>My Christmas surprises</h1>
        <p className={styles.lead} style={{ marginBottom: '2rem' }}>
          Surprises created in this browser.
        </p>
        {items === null && <p className={styles.lead}>Loading…</p>}
        {items?.length === 0 && <p className={styles.lead}>No surprises yet — let's make the first one.</p>}
        {items?.map((s) => (
          <div key={s.id} className={styles.listItem}>
            <div>
              <div className={styles.itemTitle}>
                For {s.recipientName || 'someone special'}
                <span className={styles.badge}>{s.status}</span>
                <span className={styles.badge}>{s.experience}</span>
              </div>
            </div>
            <div className={styles.itemActions} style={{ gap: '0.5rem' }}>
              {s.status === 'published' && (
                <GfxButton variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(shareUrl(s.id))}>
                  Copy link
                </GfxButton>
              )}
              <GfxLinkButton to={`/create/${s.id}`}>Edit</GfxLinkButton>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '2rem' }}>
          <Link to="/" style={{ color: 'var(--gfx-gold)' }}>
            + Create a new surprise
          </Link>
        </div>
      </div>
    </div>
  );
}
