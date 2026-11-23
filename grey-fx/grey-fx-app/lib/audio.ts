import type { MusicKey } from './types.js';

type Note = [string | null, number];

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

function freq(note: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(note)!;
  const n = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}

/** Melodies in [note, beats]. */
const SONGS: Record<Exclude<MusicKey, 'none'>, { bpm: number; notes: Note[]; bell?: boolean }> = {
  'silent-night': {
    bpm: 84,
    notes: [
      ['G4', 1.5], ['A4', 0.5], ['G4', 1], ['E4', 3], ['G4', 1.5], ['A4', 0.5], ['G4', 1], ['E4', 3],
      ['D5', 2], ['D5', 1], ['B4', 3], ['C5', 2], ['C5', 1], ['G4', 3],
      ['A4', 2], ['A4', 1], ['C5', 1.5], ['B4', 0.5], ['A4', 1], ['G4', 1.5], ['A4', 0.5], ['G4', 1], ['E4', 3],
      ['A4', 2], ['A4', 1], ['C5', 1.5], ['B4', 0.5], ['A4', 1], ['G4', 1.5], ['A4', 0.5], ['G4', 1], ['E4', 3],
      ['D5', 2], ['D5', 1], ['F5', 1.5], ['D5', 0.5], ['B4', 1], ['C5', 3], ['E5', 3],
      ['C5', 1], ['G4', 1], ['E4', 1], ['G4', 1.5], ['F4', 0.5], ['D4', 1], ['C4', 6], [null, 2],
    ],
  },
  'jingle-bells': {
    bpm: 150,
    bell: true,
    notes: [
      ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
      ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
      ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1], ['D5', 2], ['G5', 2],
      ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
      ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
      ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['C5', 4], [null, 2],
    ],
  },
  'we-wish': {
    bpm: 132,
    bell: true,
    notes: [
      ['D4', 1], ['G4', 1], ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F#4', 0.5], ['E4', 1], ['E4', 1],
      ['E4', 1], ['A4', 1], ['A4', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F#4', 1], ['D4', 1],
      ['D4', 1], ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 1], ['E4', 1],
      ['D4', 0.5], ['D4', 0.5], ['E4', 1], ['A4', 1], ['F#4', 1], ['G4', 3], [null, 2],
    ],
  },
};

/**
 * Tiny Web Audio engine: synthesized music-box carols and sound effects.
 * Audio never starts until the user explicitly enables it.
 */
class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicGain?: GainNode;
  private timer?: number;
  private track: MusicKey = 'none';
  private volume = 0.6;
  private muted = true;
  private listeners = new Set<() => void>();

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(this.master);
    return this.ctx;
  }

  /** Subscribe to state changes. */
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  /** Current state snapshot. */
  get state() {
    return { muted: this.muted, volume: this.volume, track: this.track };
  }

  private tone(f: number, start: number, dur: number, gain: number, bell = false, dest?: AudioNode) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc2.type = bell ? 'triangle' : 'sine';
    osc.frequency.value = f;
    osc2.frequency.value = f * (bell ? 2.76 : 2);
    const g2 = ctx.createGain();
    g2.gain.value = bell ? 0.18 : 0.12;
    osc.connect(g);
    osc2.connect(g2).connect(g);
    g.connect(dest || this.master!);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.35, dur * 1.6));
    osc.start(start);
    osc2.start(start);
    osc.stop(start + dur * 1.8 + 0.1);
    osc2.stop(start + dur * 1.8 + 0.1);
  }

  private scheduleLoop() {
    if (this.timer) window.clearTimeout(this.timer);
    if (this.track === 'none' || this.muted || !this.ctx) return;
    const song = SONGS[this.track];
    const beat = 60 / song.bpm;
    let t = this.ctx.currentTime + 0.1;
    for (const [n, beats] of song.notes) {
      if (n) {
        this.tone(freq(n), t, beats * beat, 0.22, song.bell, this.musicGain);
        // soft harmony a sixth below on long notes
        if (beats >= 2) this.tone(freq(n) / 1.68, t, beats * beat, 0.08, false, this.musicGain);
      }
      t += beats * beat;
    }
    const total = (t - this.ctx.currentTime) * 1000;
    this.timer = window.setTimeout(() => this.scheduleLoop(), total - 60);
  }

  /** Choose track (does not unmute). */
  setTrack(track: MusicKey) {
    if (track === this.track) return;
    this.track = track;
    if (!this.muted) this.scheduleLoop();
    this.emit();
  }

  /** Enable sound — must be called from a user gesture. */
  enable() {
    const ctx = this.ensure();
    ctx.resume();
    this.muted = false;
    this.master!.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.1);
    this.scheduleLoop();
    this.emit();
  }

  /** Mute everything. */
  mute() {
    this.muted = true;
    if (this.ctx) this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    if (this.timer) window.clearTimeout(this.timer);
    this.emit();
  }

  /** Toggle mute. */
  toggle() {
    if (this.muted) this.enable();
    else this.mute();
  }

  /** Set volume 0..1. */
  setVolume(v: number) {
    this.volume = v;
    if (this.ctx && !this.muted) this.master!.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    this.emit();
  }

  /**
   * Play a short sound effect (silent when muted).
   * @param kind effect name.
   */
  sfx(kind: 'chime' | 'pop' | 'whoosh' | 'sparkle' | 'paper' | 'seal') {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const map: Record<string, () => void> = {
      chime: () => ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => this.tone(freq(n), t + i * 0.07, 0.4, 0.14, true)),
      sparkle: () => ['E6', 'B6', 'G#6', 'E7'].forEach((n, i) => this.tone(freq(n), t + i * 0.05, 0.25, 0.09, true)),
      pop: () => this.tone(freq('G5'), t, 0.12, 0.2, true),
      seal: () => this.tone(freq('C4'), t, 0.18, 0.25),
      whoosh: () => this.noise(0.6, 600, 0.12),
      paper: () => this.noise(0.35, 2400, 0.08),
    };
    map[kind]?.();
  }

  private noise(dur: number, f: number, gain: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(this.master!);
    src.start();
  }
}

/** Shared audio engine singleton. */
export const audio = new AudioEngine();
