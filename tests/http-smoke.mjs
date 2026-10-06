import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
const base = 'https://vdoxjbftaegdjvjpspql.supabase.co';
const key = 'sb_publishable_gclaFmqO5H4XwackSK6SNw_FgdUq-zK';
const results = [];
const ids = [];
const check = (condition, name) => {
  assert.ok(condition, name);
  results.push({ name, passed: true });
  console.log('PASS', name);
};
const call = async (body, extra = {}) => {
  const r = await fetch(base + '/functions/v1/bareeq-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, ...extra },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
};
const order = {
  branch_id: '90909090-9090-4090-8090-909090909090',
  source: 'web',
  fulfillment: 'takeaway',
  customer_name: 'AUTOMATED TEST',
  notes: 'Disposable integration test; no preparation or payment.',
  payment_method: 'cash',
  items: [
    {
      product_id: '0e0O1GEDvZQCHk9zuvfd',
      quantity: 2,
      modifier_ids: [],
      variant_id: null,
    },
  ],
};
try {
  const quote = await call({ action: 'quote', order });
  check(
    quote.status === 200 && quote.data.total_minor === 23000,
    'live quote uses current DB price',
  );
  for (const extra of [
    { total_minor: 1 },
    { payment_status: 'verified' },
    { discount: 999 },
    { role: 'founder' },
  ]) {
    const r = await call({ action: 'quote', order: { ...order, ...extra } });
    check(
      r.status === 400 && r.data.error === 'INVALID_FIELDS',
      'reject forged ' + Object.keys(extra)[0],
    );
  }
  const qbad = await call({
    action: 'quote',
    order: { ...order, items: [{ ...order.items[0], quantity: 0 }] },
  });
  check(qbad.status === 400, 'reject zero quantity over HTTP');
  const create = {
    action: 'create',
    order: { ...order, quote_hash: quote.data.quote_hash },
    key: randomUUID(),
    token: randomBytes(32).toString('hex'),
  };
  const [a, b] = await Promise.all([call(create), call(create)]);
  check(
    a.status === 200 && b.status === 200 && a.data.id === b.data.id,
    'concurrent duplicate submissions create one order',
  );
  ids.push(a.data.id);
  check(a.data.status === 'new', 'cash order immediately actionable');
  const status = await call({
    action: 'order',
    id: a.data.id,
    token: create.token,
  });
  check(
    status.status === 200 && status.data.total_minor === 23000,
    'customer can resume saved order',
  );
  const guessed = await call({
    action: 'order',
    id: a.data.id,
    token: randomBytes(32).toString('hex'),
  });
  check(
    guessed.status === 400 && guessed.data.error === 'NOT_FOUND',
    'guessed customer capability denied',
  );
  const forbidden = await call({
    action: 'transition',
    id: a.data.id,
    next: 'completed',
  });
  check(forbidden.status === 401, 'unauthenticated status mutation denied');
  const forged = await call(
    { action: 'transition', id: a.data.id, next: 'completed' },
    { Authorization: 'Bearer forged.jwt.token' },
  );
  check(forged.status === 401, 'forged JWT denied');
  const instaCreate = {
    action: 'create',
    order: {
      ...order,
      payment_method: 'instapay',
      quote_hash: quote.data.quote_hash,
    },
    key: randomUUID(),
    token: randomBytes(32).toString('hex'),
  };
  const insta = await call(instaCreate);
  check(
    insta.status === 200 && insta.data.status === 'awaiting_receipt',
    'InstaPay waits for receipt',
  );
  ids.push(insta.data.id);
  const upload = async (bytes, mime) => {
    const r = await fetch(base + '/functions/v1/bareeq-api', {
      method: 'POST',
      signal: AbortSignal.timeout(60000),
      headers: {
        apikey: key,
        'Content-Type': mime,
        'x-order-id': insta.data.id,
        'x-order-token': instaCreate.token,
      },
      body: bytes,
    });
    const raw = await r.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { error: 'Non-JSON upload response' };
    }
    console.log('Upload HTTP status', r.status);
    return { status: r.status, data: result };
  };
  const invalid = await upload(new Uint8Array(32), 'image/png');
  check(invalid.status === 400, 'spoofed image rejected');
  // Oversize rejection is covered by validator tests; this network path can be rejected by the gateway before a JSON response.
  const uploaded = await upload(
    fs.readFileSync('public/assets/bareeq-logo.png'),
    'image/png',
  );
  console.log(
    'Receipt upload result',
    uploaded.status,
    uploaded.data.error ?? uploaded.data.status,
  );
  check(
    uploaded.status === 200 &&
      uploaded.data.status === 'awaiting_payment_verification',
    'valid image re-encoded and waits for Founder',
  );
  const privateRead = await call({ action: 'receipt', id: insta.data.id });
  check(privateRead.status === 401, 'private receipt requires Founder auth');
  const direct = await fetch(base + '/rest/v1/orders?select=id', {
    headers: { apikey: key },
  });
  check(
    direct.status === 401 || direct.status === 403,
    'anonymous direct order read denied',
  );
  const rpc = await fetch(base + '/rest/v1/rpc/bareeq_quote', {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p: order }),
  });
  check(
    rpc.status === 401 || rpc.status === 403,
    'direct privileged pricing RPC denied',
  );
} finally {
  fs.writeFileSync(
    'work/e2e-fixtures.json',
    JSON.stringify({ ids, branch: order.branch_id }),
  );
  fs.writeFileSync(
    'docs/http-test-results.json',
    JSON.stringify(results, null, 2),
  );
}
