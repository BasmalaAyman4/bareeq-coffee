import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

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
