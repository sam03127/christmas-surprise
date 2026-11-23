import { useEffect, useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { CssSnow, Eyebrow, GfxButton } from '../ui/primitives.js';
import sceneStyles from '../scenes/scenes.module.css';
import styles from './experience.module.css';

function useCountdown() {
  const calc = () => {
    const now = new Date();
    let target = new Date(now.getFullYear(), 11, 25);
    if (now > new Date(now.getFullYear(), 11, 26)) target = new Date(now.getFullYear() + 1, 11, 25);
    const diff = Math.max(0, target.getTime() - now.getTime());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      mins: Math.floor((diff / 60000) % 60),
      secs: Math.floor((diff / 1000) % 60),
      isToday: diff === 0,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = window.setInterval(() => setT(calc()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

const ORN_COLORS = ['#5A1728', '#D9AE70', '#16432F', '#F4D7A1', '#5A1728'];

/**
 * Scene 02 (recipient) — the chosen experience revealed, with Santa's message,
 * interactive ornaments and a live Christmas countdown.
 */
export function WelcomeScene({ surprise, onBegin }: { surprise: Surprise; onBegin: () => void }) {
  const romantic = surprise.experience === 'romantic';
  const cd = useCountdown();
  const [ringing, setRinging] = useState<number | null>(null);

  return (
    <section className={`${sceneStyles.scene} ${romantic ? sceneStyles.bgBurgundy : sceneStyles.bgEmerald}`}>
      <CssSnow count={40} />
      <div className={`${styles.welcomeCard} ${romantic ? '' : styles.welcomeFriend}`}>
        <div className={styles.ornaments}>
          {ORN_COLORS.map((c, i) => (
            <button
              type="button"
              key={i}
              aria-label="Ring ornament"
              className={`${styles.ornament} ${ringing === i ? styles.ornamentRing : ''}`}
              style={{ ['--c' as any]: c, animationDelay: `${i * -0.8}s` }}
              onClick={() => {
                audio.sfx('chime');
                setRinging(i);
                window.setTimeout(() => setRinging(null), 900);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <Eyebrow>{romantic ? 'A Romantic Christmas' : 'A Friendship Christmas'}</Eyebrow>
        <h2 className={sceneStyles.title}>
          {romantic ? 'My love, ' : 'Hey, '}
          <em>{surprise.recipientName}</em>
        </h2>
        <p className={sceneStyles.sub} style={{ fontSize: '1.05rem' }}>
          {surprise.greeting}
        </p>
        {surprise.santaMessage && (
          <div className={styles.santa}>
            <div className={styles.santaIcon}>🎅</div>
            <div>
              <div className={styles.santaLabel}>Santa's special message</div>
              <div className={styles.santaText}>{surprise.santaMessage}</div>
            </div>
          </div>
        )}
        <div className={styles.countdown} aria-label="Countdown to Christmas">
          {cd.isToday ? (
            <div className={sceneStyles.sub}>It's Christmas! 🎄</div>
          ) : (
            (
              [
                [cd.days, 'Days'],
                [cd.hours, 'Hours'],
                [cd.mins, 'Mins'],
                [cd.secs, 'Secs'],
              ] as const
            ).map(([n, l]) => (
              <div className={styles.cdUnit} key={l}>
                <div className={styles.cdNum}>{String(n).padStart(2, '0')}</div>
                <div className={styles.cdLabel}>{l}</div>
              </div>
            ))
          )}
        </div>
        <div className={sceneStyles.hint}>until Christmas morning</div>
        <div className={styles.welcomeActions}>
          <GfxButton onClick={onBegin}>Open my surprise</GfxButton>
        </div>
      </div>
    </section>
  );
}
