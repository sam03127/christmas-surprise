import type { ExperienceType, Surprise } from './types.js';

/** Gateway base URL injected by the platform. */
const BASE = `${(typeof process !== 'undefined' && process.env?.BACKEND_URL) || ''}/surprise-service`;

const TOKENS_KEY = 'greyfx:tokens';

/** Reads all locally-stored edit tokens. */
function readTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Persists the edit token of a surprise in this browser.
 * @param id surprise id.
 * @param token edit token.
 */
export function saveToken(id: string, token: string) {
  const all = readTokens();
  all[id] = token;
  localStorage.setItem(TOKENS_KEY, JSON.stringify(all));
}

/**
 * Returns the edit token of a surprise if this browser owns it.
 * @param id surprise id.
 */
export function getToken(id: string): string | undefined {
  return readTokens()[id];
}

/** Lists ids of surprises created on this device. */
export function listOwnedIds(): string[] {
  return Object.keys(readTokens());
}

/** Error with HTTP status. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-edit-token': token } : {}),
      ...(headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.message || 'Something went wrong');
  return body as T;
}

/** API client for the surprise service. */
export const api = {
  /** Create a new draft. */
  async create(experience: ExperienceType) {
    const out = await request<{ id: string; editToken: string }>('/surprises', {
      method: 'POST',
      body: JSON.stringify({ experience }),
    });
    saveToken(out.id, out.editToken);
    return out;
  },
  /** Load a surprise (passes the owner token when available). */
  get(id: string) {
    return request<Surprise>(`/surprises/${encodeURIComponent(id)}`, { token: getToken(id) });
  },
  /** Save changes. */
  update(id: string, patch: Partial<Surprise> & { secretPassword?: string }) {
    return request<Surprise>(`/surprises/${encodeURIComponent(id)}`, {
      method: 'PUT',
      token: getToken(id),
      body: JSON.stringify(patch),
    });
  },
  /** Publish. */
  publish(id: string) {
    return request<Surprise>(`/surprises/${encodeURIComponent(id)}/publish`, { method: 'POST', token: getToken(id) });
  },
  /** Unlock the secret section. */
  unlock(id: string, password: string) {
    return request<{ secretMessage: string }>(`/surprises/${encodeURIComponent(id)}/secret`, {
      method: 'POST',
      token: getToken(id),
      body: JSON.stringify({ password }),
    });
  },
  /** Upload a (pre-compressed) image data URL; returns the photo id. */
  async uploadPhoto(dataUrl: string) {
    const out = await request<{ id: string }>('/photos', { method: 'POST', body: JSON.stringify({ dataUrl }) });
    return out.id;
  },
};

/**
 * Resolves a stored photo id (or absolute url) to a displayable URL.
 * @param ref photo id or URL.
 */
export function photoSrc(ref?: string): string | undefined {
  if (!ref) return undefined;
  if (/^(https?:|data:|blob:)/.test(ref)) return ref;
  return `${BASE}/photos/${ref}`;
}

/**
 * Downscales and compresses an image file in the browser before upload.
 * @param file image file.
 * @param max longest side in px.
 * @returns JPEG data URL.
 */
export function compressImage(file: File, max = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}
