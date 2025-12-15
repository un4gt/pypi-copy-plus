// 存储管理
import { getPackageManager } from './package-managers';

export const STORAGE_KEY = 'preferredPackageManager';
export const THEME_KEY = 'theme';
export const LANGUAGE_KEY = 'language';
export const DEFAULT_PACKAGE_MANAGER = 'pip';
export const DEFAULT_THEME = 'system';
export const DEFAULT_LANGUAGE = 'auto';

export type Theme = 'light' | 'dark' | 'system';
export type LanguagePreference = 'auto' | 'en' | 'zh' | 'zh_TW';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'auto' || value === 'en' || value === 'zh' || value === 'zh_TW';
}

export async function getPreferredPackageManager(): Promise<string> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  const managerId = result[STORAGE_KEY];
  if (typeof managerId !== 'string') {
    return DEFAULT_PACKAGE_MANAGER;
  }
  return getPackageManager(managerId)?.id ?? DEFAULT_PACKAGE_MANAGER;
}

export async function setPreferredPackageManager(managerId: string): Promise<void> {
  const validatedManagerId = getPackageManager(managerId)?.id ?? DEFAULT_PACKAGE_MANAGER;
  await browser.storage.sync.set({ [STORAGE_KEY]: validatedManagerId });
  // 通知所有标签页更新
  await notifyContentScripts();
}

export async function getTheme(): Promise<Theme> {
  const result = await browser.storage.sync.get(THEME_KEY);
  const theme = result[THEME_KEY];
  return isTheme(theme) ? theme : DEFAULT_THEME;
}

export async function setTheme(theme: Theme): Promise<void> {
  await browser.storage.sync.set({ [THEME_KEY]: theme });
}

export async function getLanguagePreference(): Promise<LanguagePreference> {
  const result = await browser.storage.sync.get(LANGUAGE_KEY);
  const language = result[LANGUAGE_KEY];
  return isLanguagePreference(language) ? language : DEFAULT_LANGUAGE;
}

export async function setLanguagePreference(language: LanguagePreference): Promise<void> {
  const validatedLanguage = isLanguagePreference(language) ? language : DEFAULT_LANGUAGE;
  await browser.storage.sync.set({ [LANGUAGE_KEY]: validatedLanguage });
}

// 通知所有内容脚本更新
async function notifyContentScripts(): Promise<void> {
  const tabs = await browser.tabs.query({ url: '*://pypi.org/project/*' });
  for (const tab of tabs) {
    if (tab.id) {
      browser.tabs.sendMessage(tab.id, { type: 'UPDATE_COMMAND' }).catch(() => {
        // 忽略错误（标签页可能已关闭）
      });
    }
  }
}
