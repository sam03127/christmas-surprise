import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SurpriseService, HttpError } from './grey-fx/surprise-service/surprise-service.js';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'grey-fx', 'grey-fx-app', 'dist');

app.use(express.json({ limit: '12mb' }));

const service = SurpriseService.from();
const token = (req: Request) => req.header('x-edit-token') || undefined;
const wrap =
  (handler: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response) => {
    try {
      const result = await handler(req, res);
      if (!res.headersSent) res.json(result);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error(error);
      res.status(status).json({
        message: error instanceof Error ? error.message : 'Unexpected error',
      });
    }
  };

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/surprise-service/surprises', wrap((req) => service.create(req.body?.experience)));
app.get('/surprise-service/surprises/:id', wrap((req) => service.get(String(req.params.id), token(req))));
app.put('/surprise-service/surprises/:id', wrap((req) =>
  service.update(String(req.params.id), token(req), req.body || {})));
app.post('/surprise-service/surprises/:id/publish', wrap((req) =>
  service.publish(String(req.params.id), token(req))));
app.delete('/surprise-service/surprises/:id', wrap((req) =>
  service.remove(String(req.params.id), token(req))));
app.post('/surprise-service/surprises/:id/secret', wrap((req) =>
  service.unlockSecret(String(req.params.id), req.body?.password, token(req))));
app.post('/surprise-service/photos', wrap((req) => service.savePhoto(req.body?.dataUrl)));
app.get('/surprise-service/photos/:id', wrap(async (req, res) => {
  const photo = await service.getPhoto(String(req.params.id));
  res.setHeader('Content-Type', photo.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(photo.data);
}));

app.use(
  '/assets',
  express.static(path.join(dist, 'assets'), {
    immutable: true,
    maxAge: '1y',
  })
);
app.use('/assets', (_req, res) => res.status(404).send('Asset not found'));
app.use((_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(dist, 'index.html'));
});

if (!process.env.MONGO_URL) {
  console.warn('MONGO_URL is not set - surprise persistence is unavailable.');
} else {
  await mongoose.connect(process.env.MONGO_URL);
}

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`GREY FX listening on port ${port}`);
});
