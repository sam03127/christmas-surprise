import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExperienceType } from '../lib/types.js';
import { api } from '../lib/api.js';
import { audio } from '../lib/audio.js';
import { IntroScene } from '../experience/intro-scene.js';
import { CssSnow, Eyebrow, GfxButton, Logo } from '../ui/primitives.js';
import { AudioControl } from '../ui/audio-control.js';
import styles from './pages.module.css';

const OPTIONS: { key: ExperienceType; title: string; tag: string; copy: string; icon: string }[] = [
  {
    key: 'romantic',
    title: 'Romantic Christmas',
    tag: 'For couples & partners',
    copy: 'Candlelit letters, golden hearts and memories that glow — a love story wrapped in Christmas magic.',
    icon: '❤',
  },
  {
    key: 'friendship',
    title: 'Friendship Christmas',
    tag: 'For best friends',
    copy: 'Playful gifts, cute collectible cards and inside jokes under the emerald tree — for your favourite humans.',
    icon: '⛄',
  },
];

/**
 * Landing: Scene 01 village intro, then Scene 02 "choose your experience".
 */
export function HomePage() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [busy, setBusy] = useState<ExperienceType | null>(null);
  const [error, setError] = useState('');

  const choose = async (key: ExperienceType) => {
    setBusy(key);
    setError('');
    audio.sfx('chime');
    try {
      const { id } = await api.create(key);
      navigate(`/create/${id}`);
    } catch (e: any) {
      setError(e.message || 'Could not start your surprise. Please try again.');
      setBusy(null);
    }
  };

  if (!entered) {
    audio.setTrack('silent-night');
    return (
      <>
        <div className={styles.homeTop}>
          <Logo />
          <GfxButton variant="ghost" size="sm" onClick={() => navigate('/create')}>
            My surprises
          </GfxButton>
        </div>
        <IntroScene onEnter={() => setEntered(true)} />
        <AudioControl />
      </>
    );
  }

  return (
    <section className={styles.choose}>
      <CssSnow />
      <div className={styles.homeTop}>
        <Logo />
      </div>
      <header className={styles.chooseHead}>
        <Eyebrow>Scene 02 · Choose your experience</Eyebrow>
        <h1 className={styles.chooseTitle}>
          Who is this <em>magic</em> for?
        </h1>
        <p className={styles.chooseSub}>Pick a world. You'll personalise every scene next — then share it with one link.</p>
      </header>
      <div className={styles.cards}>
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`${styles.card} ${o.key === 'romantic' ? styles.cardRomantic : styles.cardFriend}`}
            onClick={() => choose(o.key)}
            disabled={busy !== null}
          >
            <span className={styles.cardLights} aria-hidden>
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </span>
            <span className={styles.cardIcon}>{o.icon}</span>
            <span className={styles.cardTag}>{o.tag}</span>
            <span className={styles.cardTitle}>{o.title}</span>
            <span className={styles.cardCopy}>{o.copy}</span>
            <span className={styles.cardCta}>{busy === o.key ? 'Preparing…' : 'Create this surprise →'}</span>
          </button>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <AudioControl />
    </section>
  );
}
