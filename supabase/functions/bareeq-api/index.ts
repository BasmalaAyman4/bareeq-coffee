import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import {
  checkout,
  object,
  text,
  uuid,
  token,
  receiptType,
} from './validation.mjs';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);
const hash = async (s: string) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
async function staff(req: Request, founder = false, allowReset = false) {
  const bearer =
    req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  const { data, error } = await db.auth.getUser(bearer);
  if (error || !data.user) throw new Error('UNAUTHENTICATED');
  let session;
  try {
    session = JSON.parse(
      atob(bearer.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    ).session_id;
  } catch {
    throw new Error('UNAUTHENTICATED');
  }
  const identity = await rpc('bareeq_identity', {
    p_user: data.user.id,
    p_session: uuid(session),
  });
  const role = identity?.role;
  if (!['founder', 'cashier'].includes(role) || (founder && role !== 'founder'))
    throw new Error('FORBIDDEN');
  if (identity.changeRequired && !allowReset)
    throw new Error('PASSWORD_CHANGE_REQUIRED');
  return {
    user: data.user.id,
    session,
    role,
    changeRequired: identity.changeRequired,
  };
}
async function readOrder(id: string, secret: string) {
  const order = await rpc('bareeq_order', {
    p_id: uuid(id),
    p_token_hash: await hash(token(secret)),
  });
  if (!order) throw new Error('NOT_FOUND');
  return order;
}
async function safeImage(req: Request) {
  if (Number(req.headers.get('content-length')) > 2097152)
    throw new Error('INVALID_FILE_SIZE');
  const reader = req.body!.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 2097152) {
      await reader.cancel();
      throw new Error('INVALID_FILE_SIZE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  receiptType(bytes, req.headers.get('content-type'));
  const image = await Image.decode(bytes);
  if (image.width * image.height > 16000000) throw new Error('IMAGE_TOO_LARGE');
  if (image.width > 1600 || image.height > 1600)
    image.resize(
      Math.round(
        image.width * Math.min(1600 / image.width, 1600 / image.height),
      ),
      Math.round(
        image.height * Math.min(1600 / image.width, 1600 / image.height),
      ),
    );
  return image;
}
Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const origins = (
    Deno.env.get('ALLOWED_ORIGINS') ??
    'https://bareeq-coffee.web.app,https://bareeq-coffee.firebaseapp.com,https://basmalaayman4.github.io,http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:5174,http://127.0.0.1:5175'
  )
    .split(',')
    .filter(Boolean);
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origins.length
      ? origins.includes(origin)
        ? origin
        : 'null'
      : '*',
    'Access-Control-Allow-Headers':
      'authorization, apikey, content-type, x-client-info, x-order-id, x-order-token, x-bareeq-upload',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  try {
    if (req.method !== 'POST')
      return new Response('{}', { status: 405, headers });
    if (origins.length && origin && !origins.includes(origin))
      throw new Error('FORBIDDEN');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!(await rpc('bareeq_rate', { p_key: await hash(ip), p_limit: 120 })))
      return new Response(JSON.stringify({ error: 'RATE_LIMITED' }), {
        status: 429,
        headers,
      });
    if (req.headers.get('content-type')?.startsWith('image/')) {
      if (req.headers.get('x-bareeq-upload') === 'menu-image') {
        const actor = await staff(req, true);
        const image = await safeImage(req);
        const path = `${actor.user}/${crypto.randomUUID()}.jpg`;
        const { error } = await db.storage
          .from('menu-images')
          .upload(path, await image.encodeJPEG(84), {
            contentType: 'image/jpeg',
            upsert: false,
          });
        if (error) throw new Error('UPLOAD_FAILED');
        const { data } = db.storage.from('menu-images').getPublicUrl(path);
        return Response.json({ url: data.publicUrl }, { headers });
      }
      const id = req.headers.get('x-order-id') ?? '',
        secret = req.headers.get('x-order-token') ?? '';
      const order = await readOrder(id, secret);
      if (order.status === 'awaiting_payment_verification')
        return Response.json(order, { headers });
      if (order.status !== 'awaiting_receipt')
        throw new Error('INVALID_TRANSITION');
      // Re-encode instead of storing filenames, metadata or untrusted image payloads.
      const image = await safeImage(req);
      const path = `${id}/${crypto.randomUUID()}.jpg`;
      const { error } = await db.storage
        .from('receipts')
        .upload(path, await image.encodeJPEG(80), {
          contentType: 'image/jpeg',
          upsert: false,
        });
      if (error) throw new Error('UPLOAD_FAILED');
      try {
        await rpc('bareeq_receipt', {
          p_id: id,
          p_token_hash: await hash(secret),
          p_path: path,
        });
      } catch (e) {
        await db.storage.from('receipts').remove([path]);
        throw e;
      }
      return Response.json(await readOrder(id, secret), { headers });
    }
    const bodyReader = req.body!.getReader();
    let bodySize = 0;
    const bodyChunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await bodyReader.read();
      if (done) break;
      bodySize += value.length;
      if (bodySize > 32768) {
        await bodyReader.cancel();
        throw new Error('INVALID_BODY');
      }
      bodyChunks.push(value);
    }
    const bodyBytes = new Uint8Array(bodySize);
    let bodyOffset = 0;
    for (const chunk of bodyChunks) {
      bodyBytes.set(chunk, bodyOffset);
      bodyOffset += chunk.length;
    }
    const raw = new TextDecoder().decode(bodyBytes);
    const body = JSON.parse(raw);
    let result;
    switch (body.action) {
      case 'push_config': {
        object(body, ['action']);
        await staff(req);
        const runtime = await rpc('bareeq_runtime', {});
        result = { publicKey: runtime.vapid_public ?? '' };
        break;
      }
      case 'quote':
        object(body, ['action', 'order'], ['order']);
        result = await rpc('bareeq_quote', { p: checkout(body.order) });
        break;
      case 'create': {
        object(
          body,
          ['action', 'order', 'key', 'token'],
          ['order', 'key', 'token'],
        );
        const p = checkout(body.order);
        const actor = p.source === 'cashier' ? await staff(req) : null;
        result = await rpc('bareeq_create', {
          p,
          p_key: uuid(body.key),
          p_token_hash: await hash(token(body.token)),
          p_user: actor?.user ?? null,
          p_session: actor?.session ?? null,
        });
        break;
      }
      case 'order':
        object(body, ['action', 'id', 'token'], ['id', 'token']);
        result = await readOrder(body.id, body.token);
        break;
      case 'login': {
        object(body, ['action', 'code', 'password'], ['code', 'password']);
        if (
          !(await rpc('bareeq_rate', {
            p_key: await hash(ip + 'login'),
            p_limit: 8,
          }))
        )
          throw new Error('RATE_LIMITED');
        const alias =
          body.code === '10'
            ? 'founder'
            : body.code === '00'
              ? 'cashier'
              : null;
        if (!alias) throw new Error('INVALID_CREDENTIALS');
        const authClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const signed = await authClient.auth.signInWithPassword({
          email: alias + '@staff.bareeq.invalid',
          password: text(body.password, 128, 1),
        });
        if (signed.error || !signed.data.session)
          throw new Error('INVALID_CREDENTIALS');
        result = {
          access_token: signed.data.session.access_token,
          refresh_token: signed.data.session.refresh_token,
        };
        break;
      }
      case 'me': {
        object(body, ['action']);
        result = await staff(req, false, true);
        break;
      }
      case 'password': {
        object(body, ['action', 'password', 'target'], ['password']);
        const a = await staff(req, true, true);
        const password = text(body.password, 128, 8);
        if (password === '12345678')
          throw new Error('CHOOSE_STRONGER_PASSWORD');
        let user = a.user;
        if (body.target === 'cashier') {
          if (a.changeRequired) throw new Error('PASSWORD_CHANGE_REQUIRED');
          const found = await db
            .from('staff_roles')
            .select('user_id')
            .eq('user_code', '00')
            .single();
          if (found.error) throw found.error;
          user = found.data.user_id;
        } else if (body.target && body.target !== 'self')
          throw new Error('INVALID_TARGET');
        const updated = await db.auth.admin.updateUserById(user, { password });
        if (updated.error) throw updated.error;
        // Founder owns both staff passwords. A Cashier reset returns the
        // operational account to service immediately, without a self-service
        // password screen.
        await rpc('bareeq_password_done', { p_user: user, p_reset: false });
        result = { ok: true };
        break;
      }
      case 'transition': {
        object(body, ['action', 'id', 'next', 'reason'], ['id', 'next']);
        const a = await staff(req);
        result = await rpc('bareeq_transition', {
          p_id: uuid(body.id),
          p_next: text(body.next, 40, 1),
          p_reason: text(body.reason ?? '', 500),
          p_user: a.user,
          p_session: a.session,
        });
        break;
      }
      case 'receipt': {
        object(body, ['action', 'id'], ['id']);
        await staff(req, true);
        const { data, error } = await db
          .from('receipts')
          .select('*')
          .eq('order_id', uuid(body.id))
          .maybeSingle();
        if (error) throw error;
        if (!data || data.deleted_at) {
          result = { deleted: true };
          break;
        }
        const signed = await db.storage
          .from('receipts')
          .createSignedUrl(data.path, 60);
        if (signed.error) throw signed.error;
        result = { url: signed.data.signedUrl };
        break;
      }
      case 'report': {
        object(body, ['action', 'day', 'branch_id'], ['day', 'branch_id']);
        const a = await staff(req, true);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.day))
          throw new Error('INVALID_DATE');
        result = await rpc('bareeq_report', {
          p_day: body.day,
          p_branch: uuid(body.branch_id),
          p_user: a.user,
          p_session: a.session,
        });
        break;
      }
      case 'menu_delete': {
        object(body, ['action', 'id'], ['id']);
        const actor = await staff(req, true);
        await rpc('bareeq_delete_product', {
          p_id: text(body.id, 100, 1),
          p_user: actor.user,
          p_session: actor.session,
        });
        result = { ok: true };
        break;
      }
      case 'menu_save': {
        object(body, ['action', 'entity', 'record'], ['entity', 'record']);
        const a = await staff(req, true);
        result = await rpc('bareeq_menu_save', {
          p_entity: body.entity,
          p_record: body.record,
          p_user: a.user,
          p_session: a.session,
        });
        break;
      }
      case 'subscribe': {
        object(body, ['action', 'subscription'], ['subscription']);
        const a = await staff(req);
        const s = body.subscription;
        object(s, ['endpoint', 'expirationTime', 'keys'], ['endpoint', 'keys']);
        const u = new URL(s.endpoint);
        if (
          u.protocol !== 'https:' ||
          ![
            'fcm.googleapis.com',
            'updates.push.services.mozilla.com',
            'web.push.apple.com',
          ].some((h) => u.hostname === h || u.hostname.endsWith('.' + h))
        )
          throw new Error('INVALID_PUSH_ENDPOINT');
        object(s.keys, ['auth', 'p256dh'], ['auth', 'p256dh']);
        text(s.keys.auth, 100, 16);
        text(s.keys.p256dh, 200, 50);
        const { error } = await db
          .from('push_subscriptions')
          .upsert(
            { user_id: a.user, endpoint: s.endpoint, subscription: s },
            { onConflict: 'endpoint' },
          );
        if (error) throw error;
        result = { ok: true };
        break;
      }
      default:
        throw new Error('UNKNOWN_ACTION');
    }
    return Response.json(result, { headers });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'REQUEST_FAILED';
    const safe = /^[A-Z_]+$/.test(message) ? message : 'REQUEST_FAILED';
    return Response.json(
      { error: safe },
      {
        status:
          safe === 'UNAUTHENTICATED' ? 401 : safe === 'FORBIDDEN' ? 403 : 400,
        headers,
      },
    );
  }
});
