import { audio } from '../lib/audio.js';
import { useAudio } from '../lib/use-audio.js';
import styles from './ui.module.css';

/**
 * Floating music control — sound only starts after the user taps it.
 */
export function AudioControl() {
  const { muted, volume, track } = useAudio();
  if (track === 'none') return null;
  return (
    <div className={styles.audioCtl}>
      <button
        type="button"
        className={`${styles.audioBtn} ${muted ? styles.audioMuted : ''}`}
        onClick={() => audio.toggle()}
        aria-label={muted ? 'Play music' : 'Mute music'}
      >
        {muted ? '♪' : '❚❚'}
      </button>
      {muted ? (
        <span className={styles.audioLabel}>Play music</span>
      ) : (
        <input
          aria-label="Volume"
          className={styles.volume}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => audio.setVolume(Number(e.target.value))}
        />
      )}
    </div>
  );
}
