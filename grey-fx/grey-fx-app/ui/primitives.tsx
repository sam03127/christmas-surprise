import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './ui.module.css';

/** Props for the GREY FX button. */
export type GfxButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'gold' | 'ghost';
  size?: 'md' | 'sm';
};

/**
 * Champagne-gold button used across the platform.
 * @param props button props plus visual variant.
 */
export function GfxButton({ variant = 'gold', size = 'md', className = '', ...rest }: GfxButtonProps) {
  const cls = [styles.btn, variant === 'ghost' && styles.ghost, size === 'sm' && styles.small, className]
    .filter(Boolean)
    .join(' ');
  return <button className={cls} {...rest} />;
}

/** Router link styled as a GREY FX button. */
export function GfxLinkButton({
  to,
  children,
  variant = 'gold',
}: {
  to: string;
  children: ReactNode;
  variant?: 'gold' | 'ghost';
}) {
  return (
    <Link to={to} className={[styles.btn, variant === 'ghost' && styles.ghost].filter(Boolean).join(' ')}>
      {children}
    </Link>
  );
}

/** Small uppercase gold label. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className={styles.eyebrow}>{children}</div>;
}

/** GREY FX star mark (SVG). */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="gfxStar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4D7A1" />
          <stop offset="1" stopColor="#B98C4F" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 L37.5 26.5 L60 32 L37.5 37.5 L32 60 L26.5 37.5 L4 32 L26.5 26.5 Z"
        fill="url(#gfxStar)"
      />
      <circle cx="32" cy="32" r="4" fill="#FFF1DF" />
    </svg>
  );
}

/** GREY FX wordmark linking home. */
export function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="GREY FX home">
      <StarMark className={styles.logoMark} />
      <span>
        GREY <span className={styles.logoFx}>FX</span>
      </span>
    </Link>
  );
}

/** Full-screen loading screen. */
export function LoadingScreen({ text = 'Wrapping the magic…' }: { text?: string }) {
  return (
    <div className={styles.loader} role="status">
      <div>
        <StarMark className={styles.loaderStar} />
        <div className={styles.loaderText}>{text}</div>
      </div>
    </div>
  );
}

const FLAKES = Array.from({ length: 60 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 8 + ((i * 13) % 12),
  delay: -((i * 17) % 20),
  drift: ((i % 5) - 2) * 20,
  opacity: 0.35 + ((i * 3) % 6) / 10,
}));

/** Lightweight CSS snowfall overlay. */
export function CssSnow({ count = 60 }: { count?: number }) {
  return (
    <div className={styles.snowLayer} aria-hidden>
      {FLAKES.slice(0, count).map((f, i) => (
        <span
          key={i}
          className={styles.flake}
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
            ['--drift' as any]: `${f.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
