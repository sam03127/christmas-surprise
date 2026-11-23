import mongoose, { Schema } from 'mongoose';

/**
 * A single gift inside a surprise.
 */
export type GiftData = {
  id: string;
  title: string;
  message: string;
  photoUrl?: string;
  wrap: 'burgundy' | 'emerald' | 'gold' | 'navy';
  mystery?: boolean;
};

/**
 * A memory (polaroid) inside a surprise.
 */
export type MemoryData = {
  id: string;
  photoUrl: string;
  caption: string;
  date?: string;
  description?: string;
};

/**
 * Persisted surprise document shape.
 */
export type SurpriseDoc = {
  _id: string;
  editToken: string;
  status: 'draft' | 'published';
  experience: 'romantic' | 'friendship';
  recipientName: string;
  senderName: string;
  greeting: string;
  santaMessage: string;
  scenes: string[];
  gifts: GiftData[];
  letter: string;
  memories: MemoryData[];
  globeMessage: string;
  wish: string;
  reasons: string[];
  secretHint: string;
  secretMessage: string;
  secretPasswordHash?: string;
  finalHeading: string;
  finalMessage: string;
  signature: string;
  music: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
};

const SurpriseSchema = new Schema<SurpriseDoc>(
  {
    _id: { type: String, required: true },
    editToken: { type: String, required: true, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    experience: { type: String, enum: ['romantic', 'friendship'], default: 'romantic' },
    recipientName: { type: String, default: '' },
    senderName: { type: String, default: '' },
    greeting: { type: String, default: '' },
    santaMessage: { type: String, default: '' },
    scenes: { type: [String], default: [] },
    gifts: { type: Schema.Types.Mixed, default: [] },
    letter: { type: String, default: '' },
    memories: { type: Schema.Types.Mixed, default: [] },
    globeMessage: { type: String, default: '' },
    wish: { type: String, default: '' },
    reasons: { type: [String], default: [] },
    secretHint: { type: String, default: '' },
    secretMessage: { type: String, default: '' },
    secretPasswordHash: { type: String },
    finalHeading: { type: String, default: '' },
    finalMessage: { type: String, default: '' },
    signature: { type: String, default: '' },
    music: { type: String, default: 'silent-night' },
    publishedAt: { type: Date },
  },
  { timestamps: true, minimize: false }
);

/**
 * Uploaded photo stored as binary.
 */
export type PhotoDoc = {
  _id: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
};

const PhotoSchema = new Schema<PhotoDoc>(
  {
    _id: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/** Surprise mongoose model. */
export const SurpriseModel =
  (mongoose.models.Surprise as mongoose.Model<SurpriseDoc>) ||
  mongoose.model<SurpriseDoc>('Surprise', SurpriseSchema);

/** Photo mongoose model. */
export const PhotoModel =
  (mongoose.models.Photo as mongoose.Model<PhotoDoc>) || mongoose.model<PhotoDoc>('Photo', PhotoSchema);
