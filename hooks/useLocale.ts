import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Custom hook that combines i18n translation with language context
 * Useful for components that need both translation and locale-aware formatting
 */
export function useLocale() {
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();

  return {
    t,
    language,
    locale: language === 'en' ? 'en-US' : 'vi-VN',
    i18n,
  };
}
