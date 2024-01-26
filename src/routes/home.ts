import { Context } from 'hono';
import { Bindings } from '../bindings';

export const home = async (ctx: Context<{ Bindings: Bindings }>) => {
  ctx.text('💢😭');
};
