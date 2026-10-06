import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkout,
  object,
  receiptType,
  token,
} from '../supabase/functions/bareeq-api/validation.mjs';
const order = () => ({
  branch_id: '11111111-1111-4111-8111-111111111111',
  source: 'web',
  fulfillment: 'takeaway',
  customer_name: 'Test',
  phone: '01018652532',
  payment_method: 'cash',
  items: [
    { product_id: 'latte', quantity: 1, modifier_ids: [], variant_id: null },
  ],
});
test('valid identifier-only order is accepted', () =>
  assert.equal(checkout(order()).items.length, 1));
for (const phone of [
  '',
  '123',
  '0101234567',
  '010123456789',
  '01312345678',
  'abcdefghijk',
])
  test('reject invalid customer mobile ' + JSON.stringify(phone), () =>
    assert.throws(() => checkout({ ...order(), phone }), /INVALID_PHONE/),
  );
for (const phone of [
  '+20 1018652532',
  '00201018652532',
  '٠١٠١٨٦٥٢٥٣٢',
  '۰۱۰۱۸۶۵۲۵۳۲',
])
  test('normalize mobile ' + phone, () =>
    assert.equal(checkout({ ...order(), phone }).phone, '01018652532'),
  );
for (const customer_name of [' ', 'A', '1234'])
  test('reject invalid customer name ' + JSON.stringify(customer_name), () =>
    assert.throws(() => checkout({ ...order(), customer_name })),
  );
test('cashier may create a walk-in cash or card order without customer details', () => {
  const counter = {
    ...order(),
    source: 'cashier',
    fulfillment: 'takeaway',
    customer_name: 'Walk-in customer',
    phone: '',
    notes: '',
    payment_method: 'card',
  };
  assert.equal(checkout(counter).payment_method, 'card');
});
test('payment methods stay within their correct channel', () => {
  assert.throws(
    () => checkout({ ...order(), payment_method: 'card' }),
    /INVALID_PAYMENT_METHOD/,
  );
  assert.throws(
    () =>
      checkout({
        ...order(),
        source: 'cashier',
        fulfillment: 'takeaway',
        customer_name: 'Walk-in customer',
        payment_method: 'instapay',
      }),
    /INVALID_PAYMENT_METHOD/,
  );
});
for (const field of [
  'total',
  'discount',
  'payment_status',
  'role',
  'unit_price',
])
  test('reject client ' + field, () =>
    assert.throws(() => checkout({ ...order(), [field]: 1 }), /INVALID_FIELDS/),
  );
for (const q of [0, -1, 100, 1.5, '1', null])
  test('reject quantity ' + q, () => {
    const p = order();
    p.items[0].quantity = q;
    assert.throws(() => checkout(p), /INVALID_QUANTITY/);
  });
test('reject unknown line fields', () => {
  const p = order();
  p.items[0].price = 0;
  assert.throws(() => checkout(p), /INVALID_FIELDS/);
});
test('reject duplicate modifiers', () => {
  const p = order();
  p.items[0].modifier_ids = [
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
  ];
  assert.throws(() => checkout(p), /INVALID_MODIFIERS/);
});
test('reject invalid IDs', () => {
  const p = order();
  p.branch_id = '../../etc/passwd';
  assert.throws(() => checkout(p), /INVALID_ID/);
});
test('reject empty and oversized cart', () => {
  assert.throws(() => checkout({ ...order(), items: [] }));
  assert.throws(() =>
    checkout({ ...order(), items: Array(51).fill(order().items[0]) }),
  );
});
test('reject forged token', () => assert.throws(() => token('guessed')));
test('receipt rejects executable and spoofed MIME', () => {
  assert.throws(
    () => receiptType(new Uint8Array(30), 'image/png'),
    /INVALID_FILE_TYPE/,
  );
  const png = new Uint8Array(20);
  png.set([137, 80, 78, 71]);
  assert.throws(() => receiptType(png, 'text/html'), /INVALID_FILE_TYPE/);
});
test('receipt rejects oversized files', () =>
  assert.throws(
    () => receiptType(new Uint8Array(2097153), 'image/jpeg'),
    /INVALID_FILE_SIZE/,
  ));
test('receipt accepts matching JPEG signature', () => {
  const bytes = new Uint8Array(20);
  bytes.set([255, 216, 255]);
  assert.doesNotThrow(() => receiptType(bytes, 'image/jpeg'));
});
test('request shape does not accept arrays or prototype fields', () => {
  assert.throws(() => object([], []));
  assert.throws(() => checkout(JSON.parse('{"__proto__":{"role":"founder"}}')));
});
