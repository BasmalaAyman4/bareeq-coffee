export function object(value, allowed, required = []) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((k) => !allowed.includes(k)) ||
    required.some((k) => value[k] === undefined)
  )
    throw new Error('INVALID_FIELDS');
  return value;
}
export function text(value, max = 500, min = 0) {
  if (
    typeof value !== 'string' ||
    value.trim().length < min ||
    value.length > max
  )
    throw new Error('INVALID_TEXT');
  return value.trim();
}
export function uuid(value) {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new Error('INVALID_ID');
  return value;
}
export function token(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    throw new Error('INVALID_TOKEN');
  return value;
}
export function checkout(value) {
  object(
    value,
    [
      'branch_id',
      'items',
      'source',
      'fulfillment',
      'table_id',
      'customer_name',
      'phone',
      'notes',
      'payment_method',
      'quote_hash',
    ],
    [
      'branch_id',
      'items',
      'source',
      'fulfillment',
      'customer_name',
      'payment_method',
    ],
  );
  uuid(value.branch_id);
  if (
    !['web', 'cashier'].includes(value.source) ||
    !['dine_in', 'takeaway', 'counter'].includes(value.fulfillment) ||
    !['cash', 'instapay', 'card'].includes(value.payment_method)
  )
    throw new Error('INVALID_ORDER');
  if (
    (value.source === 'web' &&
      (!['cash', 'instapay'].includes(value.payment_method) ||
        !['dine_in', 'takeaway'].includes(value.fulfillment))) ||
    (value.source === 'cashier' &&
      (!['cash', 'card'].includes(value.payment_method) ||
        !['counter', 'takeaway'].includes(value.fulfillment)))
  )
    throw new Error('INVALID_PAYMENT_METHOD');
  if (value.table_id) uuid(value.table_id);
  if (value.source === 'web') {
    value.customer_name = text(value.customer_name, 80, 2);
    if (!/\p{L}/u.test(value.customer_name))
      throw new Error('INVALID_CUSTOMER_NAME');
  } else text(value.customer_name ?? '', 80);
  text(value.phone ?? '', 30);
  const mobile = (value.phone ?? '')
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s()-]/g, '')
    .replace(/^(?:\+20|0020)/, '0');
  if ((value.source === 'web' || mobile) && !/^01[0125]\d{8}$/.test(mobile))
    throw new Error('INVALID_PHONE');
  value.phone = mobile;
  text(value.notes ?? '', 500);
  if (
    value.quote_hash !== undefined &&
    !/^[a-f0-9]{32}$/.test(value.quote_hash)
  )
    throw new Error('INVALID_QUOTE');
  if (
    !Array.isArray(value.items) ||
    value.items.length < 1 ||
    value.items.length > 50
  )
    throw new Error('INVALID_ITEMS');
  for (const line of value.items) {
    object(
      line,
      ['product_id', 'variant_id', 'modifier_ids', 'quantity'],
      ['product_id', 'modifier_ids', 'quantity'],
    );
    text(line.product_id, 100, 1);
    if (line.variant_id) uuid(line.variant_id);
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    )
      throw new Error('INVALID_QUANTITY');
    if (
      !Array.isArray(line.modifier_ids) ||
      line.modifier_ids.length > 12 ||
      new Set(line.modifier_ids).size !== line.modifier_ids.length
    )
      throw new Error('INVALID_MODIFIERS');
    line.modifier_ids.forEach(uuid);
  }
  return value;
}
export function receiptType(bytes, mime) {
  if (bytes.length < 12 || bytes.length > 2097152)
    throw new Error('INVALID_FILE_SIZE');
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!(
    (png && mime === 'image/png') ||
    (jpg && mime === 'image/jpeg') ||
    (webp && mime === 'image/webp')
  ))
    throw new Error('INVALID_FILE_TYPE');
}
