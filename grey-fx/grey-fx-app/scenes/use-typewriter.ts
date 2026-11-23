import { useEffect, useState } from 'react';

/**
 * Reveals text character by character.
 * @param text full text.
 * @param active start typing when true.
 * @param speed ms per character.
 * @returns the currently visible text and whether typing finished.
 */
export function useTypewriter(text: string, active: boolean, speed = 28) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, speed]);
  return { visible: text.slice(0, count), done: count >= text.length, skip: () => setCount(text.length) };
}
