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

// 兼容旧版本：曾使用 browser.storage.sync 存储设置。
async function getWithSyncMigration<T>(
  key: string,
  validate: (value: unknown) => T | undefined,
): Promise<T | undefined> {
  const localResult = await browser.storage.local.get(key);
  const localValue = validate(localResult[key]);
  if (localValue !== undefined) return localValue;

  try {
    const syncResult = await browser.storage.sync.get(key);
    const syncValue = validate(syncResult[key]);
    if (syncValue === undefined) return;

    await browser.storage.local.set({ [key]: syncValue });
    return syncValue;
  } catch {
    return;
  }
}

export async function getPreferredPackageManager(): Promise<string> {
  const managerId = await getWithSyncMigration(STORAGE_KEY, (value) => {
    if (typeof value !== 'string') return;
    return getPackageManager(value)?.id;
  });
  return managerId ?? DEFAULT_PACKAGE_MANAGER;
}

export async function setPreferredPackageManager(managerId: string): Promise<void> {
  const validatedManagerId = getPackageManager(managerId)?.id ?? DEFAULT_PACKAGE_MANAGER;
  await browser.storage.local.set({ [STORAGE_KEY]: validatedManagerId });
  // 通知所有标签页更新
  await notifyContentScripts();
}

export async function getTheme(): Promise<Theme> {
  const theme = await getWithSyncMigration(THEME_KEY, (value) => (isTheme(value) ? value : undefined));
  return theme ?? DEFAULT_THEME;
}

export async function setTheme(theme: Theme): Promise<void> {
  await browser.storage.local.set({ [THEME_KEY]: theme });
}

export async function getLanguagePreference(): Promise<LanguagePreference> {
  const language = await getWithSyncMigration(LANGUAGE_KEY, (value) =>
    isLanguagePreference(value) ? value : undefined,
  );
  return language ?? DEFAULT_LANGUAGE;
}

export async function setLanguagePreference(language: LanguagePreference): Promise<void> {
  const validatedLanguage = isLanguagePreference(language) ? language : DEFAULT_LANGUAGE;
  await browser.storage.local.set({ [LANGUAGE_KEY]: validatedLanguage });
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
