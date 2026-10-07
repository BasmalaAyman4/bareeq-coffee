export function normalizePhone(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s()-]/g, '')
    .replace(/^(?:\+20|0020)/, '0');
}

const messages = {
  name: [
    'Enter your name using 2–80 characters.',
    'من فضلك أدخل اسمًا صحيحًا من حرفين إلى 80 حرفًا.',
  ],
  phone: [
    'Enter a valid Egyptian mobile number, such as 01012345678.',
    'من فضلك أدخل رقم هاتف صحيحًا، مثل 01012345678.',
  ],
  address: [
    'Enter your full delivery address (5–300 characters).',
    'من فضلك أدخل عنوان التوصيل بالتفصيل (من 5 إلى 300 حرف).',
  ],
  notes: [
    'Keep your notes within 500 characters.',
    'الملاحظات لا تزيد عن 500 حرف.',
  ],
} as const;
export type CheckoutField = keyof typeof messages;
export type CheckoutFieldErrors = Partial<Record<CheckoutField, true>>;
export function fieldErrorMessage(field: CheckoutField, isArabic = false) {
  return messages[field][isArabic ? 1 : 0];
}
export function checkoutErrors({
  name,
  phone,
  address = '',
  fulfillment = 'takeaway',
  notes = '',
  staff = false,
}: {
  name: string;
  phone: string;
  address?: string;
  fulfillment?: string;
  notes?: string;
  staff?: boolean;
}): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  if (
    (!staff && (name.trim().length < 2 || !/\p{L}/u.test(name))) ||
    name.length > 80
  )
    errors.name = true;
  if (
    (!staff || phone.trim()) &&
    (phone.length > 30 || !/^01[0125]\d{8}$/.test(normalizePhone(phone)))
  )
    errors.phone = true;
  if (
    fulfillment === 'delivery' &&
    (address.trim().length < 5 || address.length > 300)
  )
    errors.address = true;
  if (notes.length > 500) errors.notes = true;
  return errors;
}
export function customerError(name: string, phone: string, staff = false) {
  const field = Object.keys(checkoutErrors({ name, phone, staff }))[0] as
    CheckoutField | undefined;
  return field ? fieldErrorMessage(field) : '';
}

export function receiptError(file: File | null) {
  if (!file) return 'Upload your InstaPay receipt before placing the order.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return 'Choose a JPG, PNG, or WebP receipt.';
  if (file.size < 12 || file.size > 2097152)
    return 'Choose a receipt image up to 2 MB.';
  return '';
}
