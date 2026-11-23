import { useCallback, useEffect, useRef, useState } from 'react';
import type { Surprise } from '../lib/types.js';
import { api } from '../lib/api.js';

/**
 * Latest draft, updated synchronously on every edit so async callbacks
 * (e.g. sequential photo uploads) never work from a stale copy.
 */
export const draftRef: { current: Surprise | null } = { current: null };

/** Save state of the editor. */
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Loads a draft surprise and autosaves edits (debounced) to the surprise service.
 * @param id surprise id.
 */
export function useDraft(id: string) {
  const [draft, setDraft] = useState<Surprise | null>(null);
  const [loadError, setLoadError] = useState<{ status?: number; message: string } | null>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const pending = useRef<Record<string, any>>({});
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    api
      .get(id)
      .then((s) => {
        if (s.secretMessage === undefined) {
          setLoadError({ status: 403, message: 'This surprise was created on another device.' });
          return;
        }
        draftRef.current = s;
        setDraft(s);
      })
      .catch((e) => setLoadError({ status: e.status, message: e.message }));
  }, [id]);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const patch = pending.current;
    if (!Object.keys(patch).length) return;
    pending.current = {};
    setSave('saving');
    try {
      await api.update(id, patch);
      setSave('saved');
    } catch {
      pending.current = { ...patch, ...pending.current };
      setSave('error');
    }
  }, [id]);

  /**
   * Update fields locally and schedule an autosave.
   * @param patch partial surprise fields (and optional secretPassword).
   */
  const update = useCallback(
    (patch: Partial<Surprise> & { secretPassword?: string }) => {
      if (draftRef.current) draftRef.current = { ...draftRef.current, ...patch };
      setDraft((d) => (d ? { ...d, ...patch } : d));
      pending.current = { ...pending.current, ...patch };
      setSave('saving');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 900);
    },
    [flush]
  );

  useEffect(() => {
    const onLeave = () => {
      if (Object.keys(pending.current).length) flush();
    };
    window.addEventListener('beforeunload', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      onLeave();
    };
  }, [flush]);

  return { draft, setDraft, update, flush, save, loadError };
}
