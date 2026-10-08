import type { Language } from './translations';
import { catalogArabic } from './catalog-copy';

export function catalogLabel(
  value: { name?: string | null; name_ar?: string | null },
  language: Language,
) {
  return language === 'ar'
    ? value.name_ar?.trim() ||
        catalogArabic[value.name ?? ''] ||
        value.name ||
        ''
    : (value.name ?? '');
}
