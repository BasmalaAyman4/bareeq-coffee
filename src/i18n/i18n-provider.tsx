import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  translations,
  type Language,
  type TranslationKey,
} from './translations';
import { arabicCopy } from './copy';
import { catalogArabic } from './catalog-copy';

type I18nContextValue = {
  language: Language;
  isArabic: boolean;
  dir: 'ltr' | 'rtl';
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};
const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = 'bareeq-language-v1';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next: Language =
      stored === 'ar' || stored === 'en'
        ? stored
        : window.navigator.language.toLowerCase().startsWith('ar')
          ? 'ar'
          : 'en';
    setLanguageState(next);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      isArabic: language === 'ar',
      dir: language === 'ar' ? ('rtl' as const) : ('ltr' as const),
      setLanguage: (next: Language) => setLanguageState(next),
      toggleLanguage: () =>
        setLanguageState((current) => (current === 'en' ? 'ar' : 'en')),
      t: (key: TranslationKey) =>
        translations[language][key] || translations.en[key],
    }),
    [language],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}

export function useCopy() {
  const { isArabic } = useI18n();
  return (text: string) => {
    if (!isArabic) return text;
    return arabicCopy[text] ?? catalogArabic[text] ?? text.replace(/\bEGP\b/g, 'ج.م');
  };
}
