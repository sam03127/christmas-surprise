/** Experience flavour. */
export type ExperienceType = 'romantic' | 'friendship';

/** Scene keys that a creator can include. */
export type SceneKey = 'gifts' | 'letter' | 'memories' | 'globe' | 'wish' | 'reasons' | 'secret' | 'finale';

/** Wrapping paper styles for gifts. */
export type WrapStyle = 'burgundy' | 'emerald' | 'gold' | 'navy';

/** A gift that the recipient unwraps. */
export type Gift = {
  id: string;
  title: string;
  message: string;
  /** Uploaded photo id (served by the surprise service). */
  photoUrl?: string;
  wrap: WrapStyle;
  mystery?: boolean;
};

/** A polaroid memory. */
export type Memory = {
  id: string;
  photoUrl: string;
  caption: string;
  date?: string;
  description?: string;
};

/** Built-in background music tracks. */
export type MusicKey = 'silent-night' | 'jingle-bells' | 'we-wish' | 'none';

/** A Christmas surprise as returned by the service. */
export type Surprise = {
  id: string;
  status: 'draft' | 'published';
  experience: ExperienceType;
  recipientName: string;
  senderName: string;
  greeting: string;
  santaMessage: string;
  scenes: SceneKey[];
  gifts: Gift[];
  letter: string;
  memories: Memory[];
  globeMessage: string;
  wish: string;
  reasons: string[];
  secretHint: string;
  /** Only present for the owner. */
  secretMessage?: string;
  hasSecret: boolean;
  hasPassword: boolean;
  finalHeading: string;
  finalMessage: string;
  signature: string;
  music: MusicKey;
  publishedAt?: string;
};

/** Scene metadata used by the dashboard and the player. */
export const SCENES: { key: SceneKey; label: string; blurb: string }[] = [
  { key: 'gifts', label: 'Gift Boxes', blurb: 'Wrapped gifts with messages & photos' },
  { key: 'letter', label: 'Letter from the Heart', blurb: 'A wax-sealed handwritten letter' },
  { key: 'memories', label: 'Our Memories', blurb: 'Floating polaroid gallery' },
  { key: 'globe', label: 'Magic Snow Globe', blurb: 'Shake it to reveal a hidden message' },
  { key: 'wish', label: 'Make a Wish', blurb: 'Click a star under the northern lights' },
  { key: 'reasons', label: "Reasons You're Special", blurb: 'Cards that reveal one reason each' },
  { key: 'secret', label: 'Secret Surprise', blurb: 'A password-protected message' },
  { key: 'finale', label: 'Final Reveal', blurb: 'The cinematic Christmas tree finale' },
];

/** Music metadata. */
export const MUSIC: { key: MusicKey; label: string }[] = [
  { key: 'silent-night', label: 'Silent Night — music box' },
  { key: 'jingle-bells', label: 'Jingle Bells — sleigh bells' },
  { key: 'we-wish', label: 'We Wish You a Merry Christmas' },
  { key: 'none', label: 'No music' },
];

/**
 * Creates a short random id for client-side list items.
 * @returns random id string.
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
