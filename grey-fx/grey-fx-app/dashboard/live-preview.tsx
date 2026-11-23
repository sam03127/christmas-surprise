import type { SceneKey, Surprise } from '../lib/types.js';
import { SCENE_COMPONENTS } from '../experience/scene-registry.js';
import { WelcomeScene } from '../experience/welcome-scene.js';
import { GfxButton } from '../ui/primitives.js';
import styles from './dashboard.module.css';

/**
 * Live, in-dashboard preview of the scene being edited (2D scenes render live;
 * heavy 3D scenes are shown via the full preview button).
 */
export function LivePreview({ draft, scene, onFull }: { draft: Surprise; scene?: string; onFull: () => void }) {
  const heavy = scene === 'finale' || scene === 'globe';
  const Scene = scene && !heavy ? SCENE_COMPONENTS[scene as SceneKey] : null;
  return (
    <aside className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.previewLabel}>Live preview</span>
        <GfxButton variant="ghost" size="sm" onClick={onFull}>
          Play full experience ↗
        </GfxButton>
      </div>
      <div className={styles.device}>
        <div className={styles.deviceInner}>
          {Scene ? (
            <Scene surprise={{ ...draft, hasSecret: true }} />
          ) : heavy ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--gfx-font-serif)', fontSize: '2.2rem', margin: 0 }}>
                {draft.finalHeading || 'Merry Christmas, You Special Human!'}
              </h2>
              <p style={{ fontFamily: 'var(--gfx-font-serif)', color: 'var(--gfx-glow)', fontSize: '1.2rem', whiteSpace: 'pre-wrap' }}>
                {draft.finalMessage}
              </p>
              <p style={{ fontFamily: 'var(--gfx-font-hand)', color: 'var(--gfx-gold)', fontSize: '2rem' }}>
                {draft.signature || `With love, ${draft.senderName}`}
              </p>
              <p style={{ color: 'var(--gfx-grey)', fontSize: '0.8rem' }}>The cinematic 3D finale plays in the full preview.</p>
            </div>
          ) : (
            <WelcomeScene surprise={draft} onBegin={onFull} />
          )}
        </div>
      </div>
    </aside>
  );
}
