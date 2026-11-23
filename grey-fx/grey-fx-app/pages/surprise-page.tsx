import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Surprise } from '../lib/types.js';
import { api, ApiError } from '../lib/api.js';
import { ExperiencePlayer } from '../experience/experience-player.js';
import { CssSnow, GfxLinkButton, LoadingScreen, StarMark } from '../ui/primitives.js';
import expStyles from '../experience/experience.module.css';

/**
 * Loads a surprise by its unique URL id and plays it. Handles invalid/deleted links.
 * @param preview when true, shows the preview banner (owner previewing a draft).
 */
export function SurprisePage({ preview = false }: { preview?: boolean }) {
  const { id = '' } = useParams();
  const [state, setState] = useState<{ surprise?: Surprise; error?: string; missing?: boolean }>({});

  useEffect(() => {
    let alive = true;
    setState({});
    api
      .get(id)
      .then((surprise) => alive && setState({ surprise }))
      .catch((e) => alive && setState({ error: e.message, missing: e instanceof ApiError && e.status === 404 }));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (state.surprise) document.title = `A Christmas surprise for ${state.surprise.recipientName} · GREY FX`;
  }, [state.surprise]);

  if (state.surprise) return <ExperiencePlayer surprise={state.surprise} previewOf={preview ? id : undefined} />;
  if (state.error) {
    return (
      <div className={expStyles.notFound}>
        <CssSnow />
        <StarMark className="" />
        <h1 className={expStyles.notFoundTitle}>
          {state.missing ? 'This surprise has melted away' : 'The magic hit a snowdrift'}
        </h1>
        <p style={{ color: 'var(--gfx-grey)', maxWidth: 440, lineHeight: 1.7 }}>
          {state.missing
            ? 'The link may be mistyped, unpublished or deleted. Ask the sender to share it again.'
            : state.error}
        </p>
        <GfxLinkButton to="/">Create your own surprise</GfxLinkButton>
      </div>
    );
  }
  return <LoadingScreen text="Unwrapping your Christmas world…" />;
}
