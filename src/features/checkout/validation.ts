export function normalizePhone(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[\s()-]/g, '')
    .replace(/^(?:\+20|0020)/, '0');
}

export function customerError(name: string, phone: string, staff = false) {
  if (!staff && (name.trim().length < 2 || !/\p{L}/u.test(name)))
    return 'Enter your name using at least two characters.';
  if (name.length > 80) return 'Keep your name within 80 characters.';
  if (
    (!staff || phone.trim()) &&
    !/^01[0125]\d{8}$/.test(normalizePhone(phone))
  )
    return 'Enter a valid Egyptian mobile number, such as 01012345678.';
  return '';
}

export function receiptError(file: File | null) {
  if (!file) return 'Upload your InstaPay receipt before placing the order.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return 'Choose a JPG, PNG, or WebP receipt.';
  if (file.size < 12 || file.size > 2097152)
    return 'Choose a receipt image up to 2 MB.';
  return '';
}
