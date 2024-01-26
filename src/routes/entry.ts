import { Context } from 'hono';
import { Bindings } from '../bindings';
import { Entry } from '../models/entry';

export const entryGet = async (ctx: Context<{ Bindings: Bindings }>) => {
  const limit = Number(ctx.req.query('limit')) ?? 10;
  const offset = Number(ctx.req.query('offset')) ?? 0;

  const countResult = await ctx.env.D1.prepare(`SELECT COUNT(*) as count FROM entry`).first();

  if (!countResult) return ctx.text('Cannot determine number of entries.');

  const { results } = await ctx.env.D1.prepare(
    `SELECT * FROM entry ORDER BY timestamp DESC LIMIT ?, ?`
  )
    .bind(offset, limit)
    .all();

  return ctx.json({
    size: countResult['count'],
    results,
  });
};

export const entryGetId = async (ctx: Context<{ Bindings: Bindings }>) => {
  const id = ctx.req.param('id');
  const result = await ctx.env.D1.prepare(`SELECT * FROM entry WHERE id = ?`).bind(id).first();
  if (result) {
    return ctx.json(result);
  } else {
    return ctx.text('Entry does not exist.', 404);
  }
};

export const entryPutId = async (ctx: Context<{ Bindings: Bindings }>) => {
  const id = ctx.req.param('id');

  const { title, subtitle, intro, body } = await ctx.req.json<Entry>();

  if (!title) return ctx.text('Missing `author` value for new entry.');
  if (!subtitle) return ctx.text('Missing `subtitle` value for new entry.');
  if (!intro) return ctx.text('Missing `intro` value for new entry.');
  if (!body) return ctx.text('Missing `body` value for new entry.');

  const { success } = await ctx.env.D1.prepare(
    `UPDATE entry SET title = ?, subtitle = ?, intro = ?, body = ? WHERE id = ?`
  )
    .bind(title, subtitle, intro, body, id)
    .run();

  if (success) {
    return ctx.text('', 201);
  } else {
    return ctx.text('', 500);
  }
};

export const entryPost = async (ctx: Context<{ Bindings: Bindings }>) => {
  const { title, subtitle, intro, body } = await ctx.req.json<Entry>();

  if (!title) return ctx.text('Missing `author` value for new entry.');
  if (!subtitle) return ctx.text('Missing `subtitle` value for new entry.');
  if (!intro) return ctx.text('Missing `intro` value for new entry.');
  if (!body) return ctx.text('Missing `body` value for new entry.');

  const timestamp = Date.now();

  const { success } = await ctx.env.D1.prepare(
    `INSERT into entry (title, subtitle, intro, body, timestamp) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(title, subtitle, intro, body, timestamp)
    .run();

  if (success) {
    return ctx.text('', 201);
  } else {
    return ctx.text('', 500);
  }
};
