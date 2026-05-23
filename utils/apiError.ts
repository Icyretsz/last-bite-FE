import i18n from '@/services/i18n';

/**
 * Maps a BE error code to a localized error message.
 * Falls back to `errors.default` if the code has no translation.
 */
export function getErrorMessage(code: number): string {
  const key = `errors.${code}`;
  const translated = i18n.t(key);
  // i18next returns the key itself when no translation is found
  return translated !== key ? translated : i18n.t('errors.default');
}
