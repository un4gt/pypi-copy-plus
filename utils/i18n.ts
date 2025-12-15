import enMessages from '@/src/_locales/en/messages.json';
import zhMessages from '@/src/_locales/zh/messages.json';
import zhTWMessages from '@/src/_locales/zh_TW/messages.json';
import type { LanguagePreference } from './storage';

export type ResolvedLanguage = Exclude<LanguagePreference, 'auto'>;

type MessageEntry = { message: string };
type LocaleMessages = Record<string, MessageEntry>;

function toDictionary(messages: LocaleMessages): Record<string, string> {
  const dictionary: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    if (typeof value?.message === 'string') {
      dictionary[key] = value.message;
    }
  }
  return dictionary;
}

const dictionaries: Record<ResolvedLanguage, Record<string, string>> = {
  en: toDictionary(enMessages as unknown as LocaleMessages),
  zh: toDictionary(zhMessages as unknown as LocaleMessages),
  zh_TW: toDictionary(zhTWMessages as unknown as LocaleMessages),
};

export function getBrowserUiLanguage(): string {
  try {
    const uiLanguage = browser.i18n.getUILanguage();
    if (typeof uiLanguage === 'string') return uiLanguage;
  } catch {
    // Ignore and fall back.
  }

  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    return navigator.language;
  }

  return '';
}

export function resolveLanguage(
  preference: LanguagePreference,
  uiLanguage: string = getBrowserUiLanguage(),
): ResolvedLanguage {
  if (preference !== 'auto') return preference;

  const normalized = uiLanguage.replace('_', '-').toLowerCase();
  if (!normalized) return 'en';

  if (normalized.startsWith('zh')) {
    const isTraditional =
      normalized.includes('hant') ||
      normalized.includes('-tw') ||
      normalized.includes('-hk') ||
      normalized.includes('-mo');
    return isTraditional ? 'zh_TW' : 'zh';
  }

  return 'en';
}

export function translate(language: ResolvedLanguage, key: string): string {
  return dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;
}
