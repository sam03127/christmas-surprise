import { useState, type FormEvent } from 'react';
import type { Surprise } from '../lib/types.js';
import { api } from '../lib/api.js';
import { audio } from '../lib/audio.js';
import { GfxButton } from '../ui/primitives.js';
import { SceneHead } from './scene-head.js';
import styles from './scenes.module.css';

/**
 * Password-protected secret message, verified server-side.
 */
export function SecretScene({ surprise }: { surprise: Surprise }) {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const out = await api.unlock(surprise.id, pw);
      audio.sfx('chime');
      setMsg(out.secretMessage);
    } catch (e: any) {
      setErr(e.message);
      setShakeKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${styles.scene} ${styles.bgCandle}`}>
      <SceneHead
        eyebrow="Scene · Secret"
        title={<>A <em>secret</em> surprise</>}
        sub="Only you know the magic word."
      />
      {msg ? (
        <div className={styles.revealCard}>{msg}</div>
      ) : (
        <form key={shakeKey} className={`${styles.lockCard} ${shakeKey ? styles.shake : ''}`} onSubmit={submit}>
          <div className={styles.lockIcon}>🔒</div>
          {surprise.secretHint && <p className={styles.sub}>Hint: {surprise.secretHint}</p>}
          <input
            className={styles.input}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter the magic word"
            aria-label="Secret password"
            autoComplete="off"
          />
          {err && <div className={styles.error}>{err}</div>}
          <GfxButton type="submit" disabled={!pw || busy}>
            {busy ? 'Checking…' : 'Unlock'}
          </GfxButton>
        </form>
      )}
    </section>
  );
}
