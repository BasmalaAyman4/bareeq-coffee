import type { Language } from './translations';

export function catalogLabel(
  value: { name?: string | null; name_ar?: string | null },
  language: Language,
) {
  return language === 'ar' && value.name_ar?.trim()
    ? value.name_ar
    : (value.name ?? '');
}
