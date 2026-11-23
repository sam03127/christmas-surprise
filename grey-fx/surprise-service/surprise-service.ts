import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SurpriseModel, PhotoModel, type SurpriseDoc } from './surprise-model.js';

/** Fields a creator is allowed to edit. */
const EDITABLE_FIELDS = [
  'experience', 'recipientName', 'senderName', 'greeting', 'santaMessage', 'scenes', 'gifts',
  'letter', 'memories', 'globeMessage', 'wish', 'reasons', 'secretHint', 'secretMessage',
  'finalHeading', 'finalMessage', 'signature', 'music',
] as const;

/** All scenes available in an experience. */
export const ALL_SCENES = ['gifts', 'letter', 'memories', 'globe', 'wish', 'reasons', 'secret', 'finale'];

/** Error carrying an HTTP status. */
export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Creates a short, URL-safe unique id.
 * @param size number of random bytes.
 * @returns base64url id.
 */
function makeId(size = 9): string {
  return randomBytes(size).toString('base64url');
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password.trim().toLowerCase(), salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored?: string): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * Serializes a surprise for the client — never leaks the edit token, password hash,
 * or the locked secret message to non-owners.
 * @param doc the stored document.
 * @param owner whether the requester holds the edit token.
 */
function serialize(doc: SurpriseDoc, owner: boolean) {
  const { _id, editToken, secretPasswordHash, secretMessage, __v, ...rest } = doc as any;
  return {
    ...rest,
    id: _id,
    hasSecret: Boolean(secretPasswordHash && secretMessage),
    hasPassword: Boolean(secretPasswordHash),
    ...(owner ? { secretMessage } : {}),
  };
}

/**
 * Business logic for creating, editing, publishing and reading surprises.
 */
export class SurpriseService {
  /**
   * Create a new draft surprise.
   * @param experience romantic or friendship.
   * @returns id and secret edit token.
   */
  async create(experience: 'romantic' | 'friendship' = 'romantic') {
    const romantic = experience !== 'friendship';
    const doc = await SurpriseModel.create({
      _id: makeId(),
      editToken: makeId(24),
      experience: romantic ? 'romantic' : 'friendship',
      scenes: ALL_SCENES,
      finalHeading: 'Merry Christmas, You Special Human!',
      greeting: romantic
        ? 'Some surprises are more special when they come from the heart.'
        : 'To the friend who makes every season brighter.',
      music: romantic ? 'silent-night' : 'jingle-bells',
    });
    return { id: doc._id, editToken: doc.editToken };
  }

  private async loadOwned(id: string, token?: string) {
    const doc = await SurpriseModel.findById(id).lean<SurpriseDoc>();
    if (!doc) throw new HttpError(404, 'Surprise not found');
    if (!token || token !== doc.editToken) throw new HttpError(403, 'Not allowed to edit this surprise');
    return doc;
  }

  /**
   * Read a surprise. Drafts are only visible to their owner.
   * @param id surprise id.
   * @param token optional edit token.
   */
  async get(id: string, token?: string) {
    const doc = await SurpriseModel.findById(id).lean<SurpriseDoc>();
    if (!doc) throw new HttpError(404, 'Surprise not found');
    const owner = Boolean(token && token === doc.editToken);
    if (!owner && doc.status !== 'published') throw new HttpError(404, 'Surprise not found');
    return serialize(doc, owner);
  }

  /**
   * Save creator changes.
   * @param id surprise id.
   * @param token edit token.
   * @param patch fields to update (plus optional `secretPassword`).
   */
  async update(id: string, token: string | undefined, patch: Record<string, any>) {
    await this.loadOwned(id, token);
    const set: Record<string, any> = {};
    const unset: Record<string, any> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in patch) set[key] = patch[key];
    }
    if (typeof patch.secretPassword === 'string') {
      if (patch.secretPassword) set.secretPasswordHash = hashPassword(patch.secretPassword);
      else unset.secretPasswordHash = 1;
    }
    if (Array.isArray(set.scenes)) set.scenes = set.scenes.filter((s: string) => ALL_SCENES.includes(s));
    const doc = await SurpriseModel.findByIdAndUpdate(
      id,
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true }
    ).lean<SurpriseDoc>();
    return serialize(doc!, true);
  }

  /** Publish a surprise so its link works for anyone. */
  async publish(id: string, token?: string) {
    const doc = await this.loadOwned(id, token);
    if (!doc.recipientName?.trim() || !doc.senderName?.trim()) {
      throw new HttpError(400, 'Recipient and sender names are required before publishing');
    }
    const updated = await SurpriseModel.findByIdAndUpdate(
      id,
      { $set: { status: 'published', publishedAt: new Date() } },
      { new: true }
    ).lean<SurpriseDoc>();
    return serialize(updated!, true);
  }

  /** Delete a surprise (owner only). */
  async remove(id: string, token?: string) {
    await this.loadOwned(id, token);
    await SurpriseModel.deleteOne({ _id: id });
    return { ok: true };
  }

  /**
   * Unlock the password-protected secret.
   * @param id surprise id.
   * @param password password guess.
   */
  async unlockSecret(id: string, password: string, token?: string) {
    const doc = await SurpriseModel.findById(id).lean<SurpriseDoc>();
    const owner = Boolean(doc && token && token === doc.editToken);
    if (!doc || (!owner && doc.status !== 'published')) throw new HttpError(404, 'Surprise not found');
    if (!verifyPassword(String(password || '').trim().toLowerCase(), doc.secretPasswordHash)) {
      throw new HttpError(401, 'That is not the magic word');
    }
    return { secretMessage: doc.secretMessage };
  }

  /**
   * Store an uploaded photo from a data URL.
   * @param dataUrl base64 image data URL.
   */
  async savePhoto(dataUrl: string) {
    const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(dataUrl || '');
    if (!match) throw new HttpError(400, 'Unsupported image');
    const data = Buffer.from(match[2], 'base64');
    if (data.length > 6 * 1024 * 1024) throw new HttpError(413, 'Image too large');
    const id = makeId(12);
    await PhotoModel.create({ _id: id, contentType: match[1], data });
    return { id };
  }

  /** Read a stored photo. */
  async getPhoto(id: string) {
    const doc = await PhotoModel.findById(id).lean();
    if (!doc) throw new HttpError(404, 'Photo not found');
    const raw: any = doc.data;
    return { contentType: doc.contentType, data: Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer ?? raw) };
  }

  /** Create a new service instance. */
  static from() {
    return new SurpriseService();
  }
}
