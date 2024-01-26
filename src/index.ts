import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifyRsaJwt } from 'verify-rsa-jwt-cloudflare-worker';
import { home } from './routes/home';
import { Bindings } from './bindings';
import { entryGet, entryGetId, entryPost, entryPutId } from './routes/entry';

const app = new Hono<{ Bindings: Bindings }>();

// Index
app.use('/*', cors());
app.get('/', home);

// Entry
app.get('/entry', entryGet);
app.get('/entry/:id', entryGetId);
app.put('/entry/:id', verifyRsaJwt());
app.put('/entry/:id', entryPutId);
app.post('/entry', verifyRsaJwt());
app.post('/entry', entryPost);

// Error
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(err.toString());
});

// Not Found
app.notFound(c => c.text('Not found.', 404));

export default app;
