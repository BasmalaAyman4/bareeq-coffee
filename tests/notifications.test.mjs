import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function workerFixture({ fail = false } = {}) {
  const calls = [];
  let handler,
    claimed = false;
  const events = [
    { id: 1, order_id: 'order-1', audience: 'founder' },
    { id: 2, order_id: 'order-2', audience: 'cashier' },
  ];
  const db = {
    async rpc(name) {
      calls.push(name);
      if (name === 'bareeq_runtime')
        return {
          data: {
            worker_secret: 'test',
            vapid_public: 'public',
            vapid_private: 'private',
          },
        };
      if (name === 'bareeq_cleanup_candidates') return { data: [] };
      if (name === 'bareeq_claim_notifications') {
        const data = claimed ? [] : events;
        claimed = true;
        return { data };
      }
      throw new Error(name);
    },
    from(table) {
      const query = {
        select() {
          return query;
        },
        eq() {
          return query;
        },
        in() {
          return query;
        },
        update(value) {
          calls.push(['delivered', value]);
          return query;
        },
        then(resolve) {
          return Promise.resolve({
            data:
              table === 'staff_roles'
                ? [{ user_id: 'staff' }]
                : [{ id: 'sub', subscription: {} }],
          }).then(resolve);
        },
      };
      return query;
    },
  };
  const source = fs
    .readFileSync('supabase/functions/bareeq-worker/index.ts', 'utf8')
    .replace(/^import .*;\r?\n/gm, '');
  vm.runInNewContext(ts.transpile(source, { target: ts.ScriptTarget.ES2022 }), {
    createClient: () => db,
    Deno: {
      env: { get() {} },
      serve: (fn) => {
        handler = fn;
      },
    },
    Response,
    console,
    webpush: {
      setVapidDetails() {},
      async sendNotification(_, payload) {
        calls.push(['push', JSON.parse(payload)]);
        if (fail) throw new Error('provider unavailable');
      },
    },
  });
  const run = (body = {}, auth = 'Bearer test') =>
    handler(
      new Request('https://worker.test', {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  return { calls, run };
}

test('immediate worker skips cleanup and concurrent scheduled run cannot claim the same events', async () => {
  const f = workerFixture();
  const first = await f.run({ mode: 'notifications' });
  assert.equal(first.status, 200);
  assert.equal(f.calls.includes('bareeq_cleanup_candidates'), false);
  await Promise.all([f.run(), f.run({ mode: 'notifications' })]);
  const pushes = f.calls.filter((c) => c[0] === 'push');
  assert.equal(pushes.length, 2);
  assert.equal(pushes[0][1].url, '/founder?order=order-1');
  assert.equal(pushes[1][1].url, '/cashier?order=order-2');
  assert.ok(f.calls.includes('bareeq_cleanup_candidates'));
});

test('provider failure retains events for scheduled retry', async () => {
  const f = workerFixture({ fail: true });
  assert.equal((await f.run({ mode: 'notifications' })).status, 200);
  assert.equal(f.calls.filter((c) => c[0] === 'delivered').length, 0);
});

test('notification-only mode remains authenticated', async () => {
  const f = workerFixture();
  assert.equal(
    (await f.run({ mode: 'notifications' }, 'Bearer wrong')).status,
    403,
  );
  assert.equal(f.calls.includes('bareeq_claim_notifications'), false);
});

test('wake-up is background work and network failure does not reject checkout', async () => {
  const source = fs.readFileSync(
    'supabase/functions/bareeq-api/index.ts',
    'utf8',
  );
  const helper = source.slice(
    source.indexOf('function dispatchNotifications()'),
    source.indexOf('async function staff('),
  );
  let background;
  const calls = [];
  const context = vm.createContext({
    EdgeRuntime: {
      waitUntil(p) {
        background = p;
      },
    },
    rpc: async () => ({ worker_secret: 'test' }),
    Deno: { env: { get: () => 'https://test.supabase.co' } },
    AbortSignal,
    console: { error: () => calls.push('retry retained') },
    fetch: async (_, options) => {
      calls.push(JSON.parse(options.body));
      throw new Error('offline');
    },
  });
  vm.runInContext(ts.transpile(helper), context);
  assert.equal(vm.runInContext('dispatchNotifications()', context), undefined);
  await background;
  assert.equal(calls[0].mode, 'notifications');
  assert.equal(calls[1], 'retry retained');
});

for (const scope of [
  'https://example.com/',
  'https://example.com/bareeq-coffee/',
]) {
  test('push links remain inside app scope ' + scope, () => {
    const context = vm.createContext({
      URL,
      self: { registration: { scope }, addEventListener() {} },
    });
    vm.runInContext(fs.readFileSync('public/sw.js', 'utf8'), context);
    assert.equal(
      vm.runInContext("orderUrl('/founder?order=123')", context),
      scope + 'founder?order=123',
    );
    assert.equal(
      vm.runInContext("orderUrl('/cashier?order=456')", context),
      scope + 'cashier?order=456',
    );
    assert.equal(
      vm.runInContext("orderUrl('https://untrusted.example/path')", context),
      scope,
    );
  });
}

function notificationFixture(permission, failSubscribe = false) {
  const calls = [],
    values = [];
  let cursor = 0;
  const react = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [
        values[index],
        (next) => {
          values[index] = next;
        },
      ];
    },
    useRef: (initial) => {
      const index = cursor++;
      return (values[index] ??= { current: initial });
    },
    useCallback: (callback) => callback,
    useEffect: () => {},
  };
  const notification = {
    requestPermission: () => {
      calls.push('permission');
      return Promise.resolve(permission);
    },
  };
  const registration = {
    pushManager: {
      getSubscription: async () => null,
      subscribe: async () => {
        calls.push('subscribe');
        if (failSubscribe) throw new Error('Subscription failed');
        return { toJSON: () => ({ endpoint: 'test' }) };
      },
    },
  };
  const AudioContext = class {
    state = 'running';
    currentTime = 0;
    destination = {};
    async resume() {
      calls.push('audio');
    }
    createOscillator() {
      return {
        connect() {},
        disconnect() {},
        frequency: {},
        start() {},
        stop() {},
      };
    }
    createGain() {
      return {
        connect() {},
        disconnect() {},
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      };
    }
  };
  const code = ts.transpileModule(
    fs.readFileSync('src/features/orders/hooks/use-notifications.ts', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const exports = {};
  const dependencies = {
    react,
    '@/services/api': {
      api: async (action) => {
        calls.push(action);
        return action === 'push_config'
          ? { publicKey: Buffer.from([1, 2, 3]).toString('base64url') }
          : { ok: true };
      },
    },
  };
  const context = vm.createContext({
    Error,
    exports,
    require: (name) => dependencies[name],
    AudioContext,
    Notification: notification,
    window: { Notification: notification, PushManager: {} },
    navigator: {
      serviceWorker: {
        register: async (path) => {
          calls.push(path);
        },
        ready: Promise.resolve(registration),
      },
    },
    location: { pathname: '/bareeq-coffee/founder/' },
    atob,
  });
  vm.runInContext(code, context);
  const render = () => {
    cursor = 0;
    return exports.useNotifications(true, 'staff-id');
  };
  return { render, calls };
}
test('notification permission is requested directly on tap before fetching settings', async () => {
  const f = notificationFixture('granted');
  const pending = f.render().enableAlerts();
  assert.ok(f.calls.includes('permission'));
  assert.ok(!f.calls.includes('push_config'));
  await pending;
  assert.ok(f.calls.includes('/bareeq-coffee/sw.js'));
  assert.ok(f.calls.includes('subscribe'));
  assert.equal(f.render().pushReady, true);
});
test('denied notification permission shows recovery guidance without subscribing', async () => {
  const f = notificationFixture('denied');
  await f.render().enableAlerts();
  assert.ok(!f.calls.includes('subscribe'));
  assert.equal(f.render().pushReady, false);
  assert.match(f.render().notificationMessage, /blocked/);
});
test('push subscription failure stays visible and does not report success', async () => {
  const f = notificationFixture('granted', true);
  await f.render().enableAlerts();
  assert.equal(f.render().pushReady, false);
  assert.match(f.render().notificationMessage, /Subscription failed/);
  assert.equal(f.render().enabling, false);
});
