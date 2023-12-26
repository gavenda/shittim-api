import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifyRsaJwt } from 'verify-rsa-jwt-cloudflare-worker';

interface Entry {
  title: string;
  subtitle: string;
  intro: string;
  body: string;
}

type Bindings = {
  D1: D1Database;
  VERIFY_RSA_JWT: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/', async c => c.text('💢😭'));

app.get('/entry', async c => {
  const { results } = await c.env.D1.prepare(`SELECT * FROM entry ORDER BY timestamp DESC LIMIT 10`).all();

  return c.json(results);
});

app.get('/entry/:id', async c => {
  const id = c.req.param('id');
  const result = await c.env.D1.prepare(`SELECT * FROM entry WHERE id = ?`).bind(id).first();
  if (result) {
    return c.json(result);
  } else {
    return c.text('Entry does not exist.', 404);
  }
});

app.post('/entry', verifyRsaJwt());

app.post('/entry', async c => {
  const { title, subtitle, intro, body } = await c.req.json<Entry>();

  if (!title) return c.text('Missing `author` value for new entry.');
  if (!subtitle) return c.text('Missing `subtitle` value for new entry.');
  if (!intro) return c.text('Missing `intro` value for new entry.');
  if (!body) return c.text('Missing `body` value for new entry.');

  const timestamp = Date.now();

  const { success } = await c.env.D1.prepare(
    `INSERT into entry (title, subtitle, intro, body, timestamp) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(title, subtitle, intro, body, timestamp)
    .run();

  if (success) {
    return c.text('', 201);
  } else {
    return c.text('', 500);
  }
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(err.toString());
});

app.notFound(c => c.text('Not found.', 404));

export default app;
