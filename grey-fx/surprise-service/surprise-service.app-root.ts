import express, { type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import { SurpriseService, HttpError } from './surprise-service.js';

type Handler = (req: Request, res: Response) => Promise<unknown>;

/** Wraps async handlers and maps errors to HTTP responses. */
const wrap = (fn: Handler) => async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await fn(req, res);
    if (!res.headersSent) res.json(result);
  } catch (err: any) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ message: err?.message || 'Unexpected error' });
  }
};

/**
 * Starts the surprise REST service.
 * @returns port and a stop handle.
 */
export async function run() {
  if (process.env.MONGO_URL) {
    await mongoose.connect(process.env.MONGO_URL);
  } else {
    console.warn('MONGO_URL is not set — the surprise service cannot persist data.');
  }

  const app = express();
  const service = SurpriseService.from();
  const port = process.env.PORT || 3000;

  app.use(express.json({ limit: '12mb' }));

  const token = (req: Request) => (req.header('x-edit-token') || undefined) as string | undefined;

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.post('/surprises', wrap(async (req) => service.create(req.body?.experience)));
  app.get('/surprises/:id', wrap(async (req) => service.get(String(req.params.id), token(req))));
  app.put('/surprises/:id', wrap(async (req) => service.update(String(req.params.id), token(req), req.body || {})));
  app.post('/surprises/:id/publish', wrap(async (req) => service.publish(String(req.params.id), token(req))));
  app.delete('/surprises/:id', wrap(async (req) => service.remove(String(req.params.id), token(req))));
  app.post(
    '/surprises/:id/secret',
    wrap(async (req) => service.unlockSecret(String(req.params.id), req.body?.password, token(req)))
  );
  app.post('/photos', wrap(async (req) => service.savePhoto(req.body?.dataUrl)));
  app.get(
    '/photos/:id',
    wrap(async (req, res) => {
      const photo = await service.getPhoto(String(req.params.id));
      res.setHeader('Content-Type', photo.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.end(photo.data);
    })
  );

  const server = app.listen(port, () => {
    console.log(`🎁  Surprise service ready at: http://localhost:${port}`);
  });

  return {
    port,
    stop: async () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
