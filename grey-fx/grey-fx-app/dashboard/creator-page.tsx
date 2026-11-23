import { useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { audio } from '../lib/audio.js';
import { Eyebrow, GfxButton, GfxLinkButton, LoadingScreen, Logo } from '../ui/primitives.js';
import { useDraft } from './use-draft.js';
import {
  BasicsSection,
  ScenesSection,
  GiftsSection,
  LetterSection,
  MemoriesSection,
  MagicSection,
  ReasonsSection,
  FinaleSectionEditor,
  type SectionProps,
} from './editor-sections.js';
import { LivePreview } from './live-preview.js';
import expStyles from '../experience/experience.module.css';
import styles from './dashboard.module.css';

type Tab = {
  key: string;
  label: string;
  icon: string;
  title: string;
  lead: string;
  scene?: string;
  Comp: (p: SectionProps) => ReactElement;
};

const TABS: Tab[] = [
  { key: 'basics', label: 'Recipient', icon: '✦', title: 'Who is this for?', lead: 'Names, experience type and your opening greeting.', Comp: BasicsSection },
  { key: 'scenes', label: 'Scenes', icon: '❖', title: 'Choose your scenes', lead: 'Pick which moments play. Empty scenes are skipped automatically.', Comp: ScenesSection },
  { key: 'gifts', label: 'Gifts', icon: '🎁', title: 'Wrap your gifts', lead: 'Each gift unwraps to reveal a message — and optionally a photo.', scene: 'gifts', Comp: GiftsSection },
  { key: 'letter', label: 'Letter', icon: '✉', title: 'A letter from the heart', lead: 'Write anything. It will be revealed in handwriting, word by word.', scene: 'letter', Comp: LetterSection },
  { key: 'memories', label: 'Memories', icon: '📷', title: 'Your memories', lead: 'Upload photos, add captions and arrange them in order.', scene: 'memories', Comp: MemoriesSection },
  { key: 'magic', label: 'Globe, Wish & Secret', icon: '❄', title: 'Hidden magic', lead: 'Messages hidden in the snow globe, the wishing star and a password-protected secret.', Comp: MagicSection },
  { key: 'reasons', label: 'Reasons', icon: '❤', title: "Reasons why they're special", lead: 'Each reason becomes a card the recipient flips open.', scene: 'reasons', Comp: ReasonsSection },
  { key: 'finale', label: 'Finale & Music', icon: '★', title: 'The final reveal', lead: 'The last words under the glowing tree — and the soundtrack.', scene: 'finale', Comp: FinaleSectionEditor },
];

/**
 * Creator dashboard: section editor, live preview, autosave and publish.
 */
export function CreatorPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { draft, update, flush, save, loadError } = useDraft(id);
  const [tab, setTab] = useState('basics');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  if (loadError) {
    return (
      <div className={expStyles.notFound}>
        <h1 className={expStyles.notFoundTitle}>We couldn't open this editor</h1>
        <p style={{ color: 'var(--gfx-grey)', maxWidth: 440 }}>
          {loadError.status === 404 ? 'This surprise does not exist or was deleted.' : loadError.message} Editing is only possible from the browser that created it.
        </p>
        <GfxLinkButton to="/">Start a new surprise</GfxLinkButton>
      </div>
    );
  }
  if (!draft) return <LoadingScreen text="Opening your workshop…" />;

  const current = TABS.find((t) => t.key === tab)!;
  const sceneOff = current.scene && !draft.scenes.includes(current.scene as any);

  const publish = async () => {
    setError('');
    if (!draft.recipientName.trim() || !draft.senderName.trim()) {
      setTab('basics');
      setError('Add the recipient name and your name before publishing.');
      return;
    }
    setPublishing(true);
    try {
      await flush();
      await api.publish(id);
      audio.sfx('chime');
      navigate(`/create/${id}/published`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const preview = async () => {
    await flush();
    navigate(`/preview/${id}`);
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <div className={styles.sideLogo}>
          <Logo />
        </div>
        <nav className={styles.navList}>
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`${styles.navItem} ${t.key === tab ? styles.navActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              {t.label}
              {t.scene && !draft.scenes.includes(t.scene as any) && <span className={styles.navOff}>off</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <div className={`${styles.saveState} ${save === 'error' ? styles.saveError : ''}`}>
            {save === 'saving' ? 'Saving…' : save === 'error' ? 'Save failed — retrying on next edit' : save === 'saved' ? '✓ All changes saved' : draft.status === 'published' ? 'Published · edits go live instantly' : 'Draft'}
          </div>
          <GfxButton variant="ghost" size="sm" onClick={preview}>
            Full preview
          </GfxButton>
          <GfxButton size="sm" onClick={publish} disabled={publishing}>
            {publishing ? 'Publishing…' : draft.status === 'published' ? 'Share link' : 'Publish'}
          </GfxButton>
          <Link to="/create" className={styles.help} style={{ textAlign: 'center' }}>
            My surprises
          </Link>
        </div>
      </aside>

      <main className={styles.editor}>
        <header className={styles.editorHead}>
          <Eyebrow>{draft.experience === 'romantic' ? 'Romantic Christmas' : 'Friendship Christmas'}</Eyebrow>
          <h1 className={styles.h1}>{current.title}</h1>
          <p className={styles.lead}>{current.lead}</p>
          {sceneOff && (
            <p className={styles.help} style={{ marginTop: '0.6rem', color: 'var(--gfx-glow)' }}>
              This scene is currently turned off.{' '}
              <button
                type="button"
                className={styles.iconBtn}
                style={{ width: 'auto', padding: '0 0.8rem' }}
                onClick={() => update({ scenes: [...draft.scenes, current.scene as any] })}
              >
                Turn on
              </button>
            </p>
          )}
          {error && <p className={styles.saveError} style={{ marginTop: '0.8rem' }}>{error}</p>}
        </header>
        <current.Comp draft={draft} update={update} />
      </main>

      <LivePreview draft={draft} scene={current.scene} onFull={preview} />

      <div className={styles.mobileBar}>
        <span className={styles.saveState}>{save === 'saving' ? 'Saving…' : save === 'saved' ? '✓ Saved' : ''}</span>
        <GfxButton variant="ghost" size="sm" onClick={preview}>
          Preview
        </GfxButton>
        <GfxButton size="sm" onClick={publish} disabled={publishing}>
          {publishing ? '…' : 'Publish'}
        </GfxButton>
      </div>
    </div>
  );
}
