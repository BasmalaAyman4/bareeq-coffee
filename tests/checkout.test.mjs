import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(
    (name) => dependencies[name],
    exports,
  );
  return exports;
}
const validation = load('src/features/checkout/validation.ts', {});
function fixture(uploadFails = false) {
  const values = [];
  let cursor = 0;
  let cleared = 0;
  const calls = [];
  const requests = [];
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  let status = 'awaiting_receipt';
  const order = () => ({
    id: 'order-id',
    number: 123,
    status,
    payment_method: 'instapay',
  });
  globalThis.fetch = async () => {
    calls.push('upload');
    if (uploadFails) throw new Error('Connection interrupted');
    status = 'awaiting_payment_verification';
    return { ok: true, json: async () => order() };
  };
  const hook = load('src/features/checkout/hooks/use-checkout.ts', {
    react: {
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
      useEffect: () => {},
    },
    '@/features/cart/hooks/use-cart': {
      useCart: () => ({
        cart: [{ id: 'coffee', modifier_ids: [], quantity: 1 }],
        clear: () => {
          cleared++;
        },
        quantity: () => {},
      }),
    },
    '@/features/catalog/hooks/use-menu': {
      useProducts: () => [
        {
          id: 'coffee',
          available: true,
          price: 10,
          price_minor: 1000,
          variants: [],
          modifiers: [],
        },
      ],
      useMenu: () => ({
        data: { branches: [{ id: 'branch', instapay_details: '01018652532' }] },
      }),
    },
    '@/features/checkout/model': {
      PENDING: 'pending',
      secret: () => 'test-capability',
    },
    '@/lib/supabase': {
      config: { url: 'https://example.invalid', key: 'public' },
    },
    '@/services/api': {
      api: async (action, body) => {
        calls.push(action);
        requests.push({ action, body });
        return order();
      },
    },
    '../validation': validation,
  });
  const render = () => {
    cursor = 0;
    return hook.useCheckout({ checkout: true });
  };
  const controller = render();
  controller.setName('Test Customer');
  controller.setPhone('01018652532');
  controller.setMethod('instapay');
  controller.setQuote({ quote_hash: 'test-quote' });
  return {
    render,
    calls,
    requests,
    storage,
    cleared: () => cleared,
    setStatus: (next) => {
      status = next;
    },
  };
}
const receipt = { size: 100, type: 'image/png' };
test('InstaPay cannot create an order without a receipt', async () => {
  const f = fixture();
  await f.render().place();
  assert.deepEqual(f.calls, []);
  assert.match(f.render().error, /Upload your InstaPay receipt/);
});
test('receipt upload completes before the success modal opens', async () => {
  const f = fixture();
  f.render().setReceiptFile(receipt);
  await f.render().place();
  assert.deepEqual(f.calls, ['create', 'upload']);
  assert.equal(f.render().confirmationOpen, true);
  assert.equal(f.render().order.status, 'awaiting_payment_verification');
  assert.equal(f.cleared(), 1);
  f.render().dismissConfirmation();
  assert.equal(f.storage.size, 0);
});
test('failed upload keeps the existing order and retry never creates another order', async () => {
  const f = fixture(true);
  f.render().setReceiptFile(receipt);
  await f.render().place();
  assert.equal(f.render().confirmationOpen, false);
  assert.equal(JSON.parse(f.storage.get('pending')).id, 'order-id');
  assert.match(f.render().error, /Connection interrupted/);
  // The upload can have reached the server even if its response was lost.
  f.setStatus('awaiting_payment_verification');
  await f.render().uploadReceipt();
  assert.deepEqual(f.calls, ['create', 'upload', 'order']);
  assert.equal(f.render().confirmationOpen, true);
});
test('frontend accepts Arabic digits and rejects an invalid Egyptian prefix', () => {
  assert.equal(validation.customerError('عميل تجريبي', '٠١٠١٨٦٥٢٥٣٢'), '');
  assert.match(
    validation.customerError('Customer', '01312345678'),
    /Egyptian mobile/,
  );
});
test('invalid details produce field errors without sending an order or a page-wide error', async () => {
  const f = fixture();
  f.render().setName(' ');
  f.render().setPhone('123');
  f.render().setFulfillment('delivery');
  assert.deepEqual(f.render().fieldErrors, {});
  await f.render().place();
  assert.deepEqual(f.render().fieldErrors, {
    name: true,
    phone: true,
    address: true,
  });
  assert.equal(f.render().error, '');
  assert.deepEqual(f.calls, []);
  f.render().setPhone('01018652532');
  assert.equal(f.render().fieldErrors.phone, undefined);
});
test('delivery adds exactly EGP 30 and changing to collection removes the fee and address', () => {
  const f = fixture();
  assert.equal(f.render().estimatedTotal, 1000);
  f.render().setFulfillment('delivery');
  f.render().setAddress('  10 Test Street  ');
  f.render().setNotes('Leave at reception');
  assert.equal(f.render().deliveryMinor, 3000);
  assert.equal(f.render().estimatedTotal, 4000);
  assert.equal(f.render().payload().address, '10 Test Street');
  assert.equal(f.render().payload().notes, 'Leave at reception');
  assert.equal(f.render().payload().delivery_minor, undefined);
  f.render().setFulfillment('takeaway');
  assert.equal(f.render().estimatedTotal, 1000);
  assert.equal(f.render().payload().address, undefined);
});
test('delivery address stays in the saved order for safe retries', async () => {
  const f = fixture();
  f.render().setReceiptFile(receipt);
  f.render().setFulfillment('delivery');
  f.render().setAddress('10 Test Street, apartment 2');
  await f.render().place();
  assert.equal(
    JSON.parse(f.storage.get('pending')).order.address,
    '10 Test Street, apartment 2',
  );
  assert.equal(f.requests[0].body.order.address, '10 Test Street, apartment 2');
});
