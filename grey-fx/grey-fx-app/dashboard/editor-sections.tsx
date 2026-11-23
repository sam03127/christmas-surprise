import type { Gift, Memory, Surprise, WrapStyle } from '../lib/types.js';
import { SCENES, MUSIC, uid } from '../lib/types.js';
import { audio } from '../lib/audio.js';
import { Field, TextInput, TextArea, PhotoDrop, Thumb } from './fields.js';
import { draftRef } from './use-draft.js';
import styles from './dashboard.module.css';

/** Props shared by every editor section. */
export type SectionProps = {
  draft: Surprise;
  update: (patch: Partial<Surprise> & { secretPassword?: string }) => void;
};

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Basics: names, experience, greeting, Santa message. */
export function BasicsSection({ draft, update }: SectionProps) {
  return (
    <>
      <div className={styles.panel}>
        <div className={styles.row}>
          <Field label="Recipient name">
            <TextInput value={draft.recipientName} onChange={(v) => update({ recipientName: v })} placeholder="e.g. Emma" maxLength={60} />
          </Field>
          <Field label="Your name">
            <TextInput value={draft.senderName} onChange={(v) => update({ senderName: v })} placeholder="e.g. Leo" maxLength={60} />
          </Field>
        </div>
        <Field label="Experience type">
          <div className={styles.seg}>
            {(['romantic', 'friendship'] as const).map((k) => (
              <button
                type="button"
                key={k}
                className={`${styles.segBtn} ${draft.experience === k ? styles.segOn : ''}`}
                onClick={() => update({ experience: k })}
              >
                {k === 'romantic' ? '❤ Romantic' : '⛄ Friendship'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Personal greeting" help="Shown on the welcome card after the village intro.">
          <TextArea value={draft.greeting} onChange={(v) => update({ greeting: v })} rows={3} maxLength={400} />
        </Field>
        <Field label="Santa's special message" help="Optional — a little note 'from Santa'.">
          <TextArea
            value={draft.santaMessage}
            onChange={(v) => update({ santaMessage: v })}
            rows={3}
            maxLength={400}
            placeholder="Ho ho ho! I checked my list twice — you've been wonderful this year…"
          />
        </Field>
      </div>
    </>
  );
}

/** Choose which scenes play. */
export function ScenesSection({ draft, update }: SectionProps) {
  const toggle = (k: string) => {
    const set = new Set(draft.scenes);
    if (set.has(k as any)) set.delete(k as any);
    else set.add(k as any);
    update({ scenes: SCENES.map((s) => s.key).filter((x) => set.has(x)) });
  };
  return (
    <div className={styles.toggleGrid}>
      {SCENES.map((s) => {
        const on = draft.scenes.includes(s.key);
        return (
          <label key={s.key} className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}>
            <input type="checkbox" checked={on} onChange={() => toggle(s.key)} />
            <span>
              <div className={styles.toggleTitle}>{s.label}</div>
              <div className={styles.toggleBlurb}>{s.blurb}</div>
            </span>
          </label>
        );
      })}
    </div>
  );
}

const WRAP_COLORS: Record<WrapStyle, [string, string]> = {
  burgundy: ['#5A1728', '#D9AE70'],
  emerald: ['#16432F', '#F4D7A1'],
  gold: ['#C89B5E', '#5A1728'],
  navy: ['#14203d', '#D9AE70'],
};

/** Gift boxes editor. */
export function GiftsSection({ draft, update }: SectionProps) {
  const gifts = draft.gifts || [];
  const set = (i: number, patch: Partial<Gift>) => update({ gifts: gifts.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  return (
    <>
      {gifts.map((g, i) => (
        <div className={styles.item} key={g.id}>
          <div className={styles.itemHead}>
            <span className={styles.itemTitle}>Gift {i + 1}</span>
            <span className={styles.itemActions}>
              <button type="button" className={styles.iconBtn} disabled={i === 0} onClick={() => update({ gifts: move(gifts, i, -1) })} aria-label="Move up">↑</button>
              <button type="button" className={styles.iconBtn} disabled={i === gifts.length - 1} onClick={() => update({ gifts: move(gifts, i, 1) })} aria-label="Move down">↓</button>
              <button type="button" className={styles.iconBtn} onClick={() => update({ gifts: gifts.filter((_, j) => j !== i) })} aria-label="Remove gift">✕</button>
            </span>
          </div>
          <Field label="Gift title">
            <TextInput value={g.title} onChange={(v) => set(i, { title: v })} placeholder="A cosy evening, just us" />
          </Field>
          <Field label="Message inside">
            <TextArea value={g.message} onChange={(v) => set(i, { message: v })} rows={3} />
          </Field>
          <div className={styles.row}>
            <Field label="Wrapping paper">
              <div className={styles.wraps}>
                {(Object.keys(WRAP_COLORS) as WrapStyle[]).map((w) => (
                  <button
                    type="button"
                    key={w}
                    aria-label={w}
                    className={`${styles.wrapSwatch} ${g.wrap === w ? styles.wrapOn : ''}`}
                    style={{ backgroundColor: WRAP_COLORS[w][0], ['--ribbon' as any]: WRAP_COLORS[w][1] }}
                    onClick={() => set(i, { wrap: w })}
                  />
                ))}
              </div>
            </Field>
            <label className={`${styles.toggle} ${g.mystery ? styles.toggleOn : ''}`} style={{ alignSelf: 'end', marginBottom: '1.1rem' }}>
              <input type="checkbox" checked={Boolean(g.mystery)} onChange={(e) => set(i, { mystery: e.target.checked })} />
              <span>
                <div className={styles.toggleTitle}>Mystery gift</div>
                <div className={styles.toggleBlurb}>Hide the title until opened</div>
              </span>
            </label>
          </div>
          <Field label="Photo reveal (optional)">
            <div className={styles.upload}>
              <Thumb photo={g.photoUrl} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <PhotoDrop label={g.photoUrl ? 'Replace photo' : 'Add a photo inside this gift'} onUploaded={(id) => set(i, { photoUrl: id })} />
              </div>
              {g.photoUrl && (
                <button type="button" className={styles.iconBtn} onClick={() => set(i, { photoUrl: undefined })} aria-label="Remove photo">✕</button>
              )}
            </div>
          </Field>
        </div>
      ))}
      <button
        type="button"
        className={styles.addBtn}
        onClick={() =>
          update({
            gifts: [...gifts, { id: uid(), title: '', message: '', wrap: (['burgundy', 'emerald', 'gold', 'navy'] as WrapStyle[])[gifts.length % 4] }],
          })
        }
      >
        + Add a gift
      </button>
    </>
  );
}

/** Letter editor. */
export function LetterSection({ draft, update }: SectionProps) {
  return (
    <div className={styles.panel}>
      <Field label="Your letter" help="Written in handwriting and revealed with a typewriter animation.">
        <TextArea
          hand
          value={draft.letter}
          onChange={(v) => update({ letter: v })}
          maxLength={6000}
          placeholder={`My dearest ${draft.recipientName || '…'},\n\n`}
        />
      </Field>
      <Field label="Signature">
        <TextInput value={draft.signature} onChange={(v) => update({ signature: v })} placeholder={`Forever yours, ${draft.senderName || '…'}`} />
      </Field>
    </div>
  );
}

/** Memories (photos) editor. */
export function MemoriesSection({ draft, update }: SectionProps) {
  const memories = draft.memories || [];
  const set = (i: number, patch: Partial<Memory>) => update({ memories: memories.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  return (
    <>
      <PhotoDrop
        multiple
        label="Drop your favourite photos here or tap to upload (multiple allowed)"
        onUploaded={(id) =>
          update({ memories: [...(draftRef.current?.memories || memories), { id: uid(), photoUrl: id, caption: '', date: '', description: '' }] })
        }
      />
      {memories.map((m, i) => (
        <div className={styles.item} key={m.id}>
          <div className={styles.memoryItem}>
            <Thumb photo={m.photoUrl} className={styles.memoryImg} />
            <div>
              <div className={styles.itemHead}>
                <span className={styles.itemTitle}>Memory {i + 1}</span>
                <span className={styles.itemActions}>
                  <button type="button" className={styles.iconBtn} disabled={i === 0} onClick={() => update({ memories: move(memories, i, -1) })} aria-label="Move up">↑</button>
                  <button type="button" className={styles.iconBtn} disabled={i === memories.length - 1} onClick={() => update({ memories: move(memories, i, 1) })} aria-label="Move down">↓</button>
                  <button type="button" className={styles.iconBtn} onClick={() => update({ memories: memories.filter((_, j) => j !== i) })} aria-label="Remove">✕</button>
                </span>
              </div>
              <div className={styles.row}>
                <Field label="Caption">
                  <TextInput value={m.caption} onChange={(v) => set(i, { caption: v })} placeholder="Our first snow day" />
                </Field>
                <Field label="Date">
                  <TextInput value={m.date || ''} onChange={(v) => set(i, { date: v })} placeholder="Dec 2023" maxLength={40} />
                </Field>
              </div>
              <Field label="Description">
                <TextArea value={m.description || ''} onChange={(v) => set(i, { description: v })} rows={2} maxLength={600} />
              </Field>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/** Snow globe, wish and secret editor. */
export function MagicSection({ draft, update }: SectionProps) {
  return (
    <>
      <div className={styles.panel}>
        <Field label="Snow globe hidden message">
          <TextArea value={draft.globeMessage} onChange={(v) => update({ globeMessage: v })} rows={3} maxLength={500} />
        </Field>
        <Field label="Your wish for them">
          <TextArea value={draft.wish} onChange={(v) => update({ wish: v })} rows={3} maxLength={500} />
        </Field>
      </div>
      <div className={styles.panel}>
        <Field label="Secret message (password protected)">
          <TextArea value={draft.secretMessage || ''} onChange={(v) => update({ secretMessage: v })} rows={3} maxLength={1500} />
        </Field>
        <div className={styles.row}>
          <Field label={draft.hasPassword ? 'Change magic word' : 'Magic word'} help="Not case-sensitive. Stored securely hashed.">
            <TextInput
              value={(draft as any).secretPassword || ''}
              onChange={(v) => update({ secretPassword: v, hasPassword: Boolean(v) || draft.hasPassword, hasSecret: Boolean(v && draft.secretMessage) } as any)}
              placeholder={draft.hasPassword ? '•••••• (saved)' : 'e.g. snowflake'}
              maxLength={60}
            />
          </Field>
          <Field label="Hint">
            <TextInput value={draft.secretHint} onChange={(v) => update({ secretHint: v })} placeholder="Where we first met" />
          </Field>
        </div>
      </div>
    </>
  );
}

/** Reasons editor. */
export function ReasonsSection({ draft, update }: SectionProps) {
  const reasons = draft.reasons || [];
  return (
    <>
      {reasons.map((r, i) => (
        <div className={styles.item} key={i}>
          <div className={styles.itemHead}>
            <span className={styles.itemTitle}>Reason {i + 1}</span>
            <span className={styles.itemActions}>
              <button type="button" className={styles.iconBtn} onClick={() => update({ reasons: reasons.filter((_, j) => j !== i) })} aria-label="Remove">✕</button>
            </span>
          </div>
          <TextArea value={r} onChange={(v) => update({ reasons: reasons.map((x, j) => (j === i ? v : x)) })} rows={2} maxLength={300} />
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={() => update({ reasons: [...reasons, ''] })}>
        + Add a reason
      </button>
    </>
  );
}

/** Finale + music editor. */
export function FinaleSectionEditor({ draft, update }: SectionProps) {
  return (
    <>
      <div className={styles.panel}>
        <Field label="Final heading">
          <TextInput value={draft.finalHeading} onChange={(v) => update({ finalHeading: v })} maxLength={90} />
        </Field>
        <Field label="Final message">
          <TextArea value={draft.finalMessage} onChange={(v) => update({ finalMessage: v })} rows={4} maxLength={1000} />
        </Field>
        <Field label="Signature" help="Shared with the letter.">
          <TextInput value={draft.signature} onChange={(v) => update({ signature: v })} placeholder={`With love, ${draft.senderName || '…'}`} />
        </Field>
      </div>
      <div className={styles.panel}>
        <Field label="Background music">
          <select
            className={styles.select}
            value={draft.music}
            onChange={(e) => {
              update({ music: e.target.value as any });
              audio.setTrack(e.target.value as any);
            }}
          >
            {MUSIC.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}
