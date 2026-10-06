import { Languages } from 'lucide-react';
import { useI18n } from '@/i18n/i18n-provider';
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, toggleLanguage, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language to ${t('language')}`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-bareeq-espresso/15 bg-bareeq-ivory px-3 py-2 text-xs font-bold text-bareeq-espresso transition hover:border-bareeq-burgundy hover:text-bareeq-burgundy ${compact ? 'size-10 px-0' : ''}`}
    >
      <Languages size={15} />
      <span className={compact ? 'sr-only' : ''}>
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
}
