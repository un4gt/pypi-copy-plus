import { createSignal, onMount, For, createEffect, onCleanup } from 'solid-js';
import { packageManagers } from '@/utils/package-managers';
import {
  getPreferredPackageManager,
  setPreferredPackageManager,
  getTheme,
  setTheme,
  getLanguagePreference,
  setLanguagePreference,
  type Theme,
  type LanguagePreference,
} from '@/utils/storage';
import { resolveLanguage, translate } from '@/utils/i18n';
import './App.css';

import pipIconUrl from '@/assets/package-managers/pip.svg?url';
import uvIconUrl from '@/assets/package-managers/uv.svg?url';
import poetryIconUrl from '@/assets/package-managers/poetry.svg?url';
import pipenvIconUrl from '@/assets/package-managers/pipenv.svg?url';
import condaIconUrl from '@/assets/package-managers/conda.svg?url';
import pdmIconUrl from '@/assets/package-managers/pdm.svg?url';
import ryeIconUrl from '@/assets/package-managers/rye.svg?url';
import hatchIconUrl from '@/assets/package-managers/hatch.svg?url';

const packageManagerIcons: Record<string, string> = {
  pip: pipIconUrl,
  uv: uvIconUrl,
  poetry: poetryIconUrl,
  pipenv: pipenvIconUrl,
  conda: condaIconUrl,
  pdm: pdmIconUrl,
  rye: ryeIconUrl,
  hatch: hatchIconUrl,
};

const themeMessageKey: Record<Theme, 'themeLight' | 'themeDark' | 'themeSystem'> = {
  light: 'themeLight',
  dark: 'themeDark',
  system: 'themeSystem',
};

const languageMessageKey: Record<LanguagePreference, 'languageAuto' | 'languageEnglish' | 'languageZh' | 'languageZhTW'> = {
  auto: 'languageAuto',
  en: 'languageEnglish',
  zh: 'languageZh',
  zh_TW: 'languageZhTW',
};

const languageOptions: LanguagePreference[] = ['auto', 'en', 'zh', 'zh_TW'];

function App() {
  const [selectedManager, setSelectedManager] = createSignal('pip');
  const [savedManager, setSavedManager] = createSignal('pip');
  const [currentTheme, setCurrentTheme] = createSignal<Theme>('system');
  const [languagePreference, setLanguagePreferenceState] = createSignal<LanguagePreference>('auto');
  const [savedLanguagePreference, setSavedLanguagePreference] = createSignal<LanguagePreference>('auto');
  const [saved, setSaved] = createSignal(false);
  let packageManagerDetailsRef: HTMLDetailsElement | undefined;
  let languageDetailsRef: HTMLDetailsElement | undefined;

  onMount(async () => {
    const preferred = await getPreferredPackageManager();
    const theme = await getTheme();
    const language = await getLanguagePreference();
    setSelectedManager(preferred);
    setSavedManager(preferred);
    setCurrentTheme(theme);
    setLanguagePreferenceState(language);
    setSavedLanguagePreference(language);
  });

  const resolvedLanguage = () => resolveLanguage(languagePreference());
  const t = (key: string) => translate(resolvedLanguage(), key);

  createEffect(() => {
    const lang = resolvedLanguage();
    document.documentElement.lang = lang === 'zh_TW' ? 'zh-TW' : lang;
  });

  // 应用主题
  createEffect(() => {
    const theme = currentTheme();
    const root = document.documentElement;
    
    if (theme !== 'system') {
      root.setAttribute('data-theme', theme);
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = () => {
      root.setAttribute('data-theme', media.matches ? 'dark' : 'light');
    };

    applySystemTheme();
    media.addEventListener?.('change', applySystemTheme);
    // Safari fallback
    media.addListener?.(applySystemTheme);

    onCleanup(() => {
      media.removeEventListener?.('change', applySystemTheme);
      media.removeListener?.(applySystemTheme);
    });
  });

  // 切换主题
  const cycleTheme = async () => {
    const themes: Theme[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme());
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentTheme(nextTheme);
    await setTheme(nextTheme);
  };

  // 获取主题图标
  const getThemeIcon = () => {
    const theme = currentTheme();
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '🔄'; // system
  };

  const closePackageManagerMenu = () => {
    if (packageManagerDetailsRef) {
      packageManagerDetailsRef.open = false;
    }
  };

  const closeLanguageMenu = () => {
    if (languageDetailsRef) {
      languageDetailsRef.open = false;
    }
  };

  const getSelectedPackageManager = () => {
    return packageManagers.find((pm) => pm.id === selectedManager());
  };

  const getIconUrl = (id: string) => {
    return packageManagerIcons[id] ?? pipIconUrl;
  };

  const getLanguageBadge = (language: LanguagePreference) => {
    if (language === 'en') return 'EN';
    if (language === 'zh') return '简';
    if (language === 'zh_TW') return '繁';
    return 'A';
  };

  const getLanguageSummaryText = () => {
    const preference = languagePreference();
    if (preference !== 'auto') return t(languageMessageKey[preference]);
    return `${t(languageMessageKey.auto)} (${t(languageMessageKey[resolvedLanguage()])})`;
  };

  const handleLanguageChange = (language: LanguagePreference) => {
    setLanguagePreferenceState(language);
    closeLanguageMenu();
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    if (selectedManager() !== savedManager()) {
      await setPreferredPackageManager(selectedManager());
    }
    if (languagePreference() !== savedLanguagePreference()) {
      await setLanguagePreference(languagePreference());
    }

    setSavedManager(selectedManager());
    setSavedLanguagePreference(languagePreference());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = () =>
    selectedManager() !== savedManager() || languagePreference() !== savedLanguagePreference();

  return (
    <div class="container">
      <div class="header">
        <h1>{t('settingsTitle')}</h1>
        <button 
          class="theme-toggle" 
          onClick={cycleTheme}
          title={`${t('selectTheme')}: ${t(themeMessageKey[currentTheme()])}`}
        >
          {getThemeIcon()}
        </button>
      </div>
      
      <div class="settings-group">
        <div class="settings-section">
          <label class="label">
            <span class="label-icon">🌐</span>
            {t('selectLanguage')}
          </label>
          
          <details class="pm-select" ref={languageDetailsRef}>
            <summary class="pm-select__summary">
              <div class="pm-select__value">
                <span class="pm-icon pm-icon--badge" aria-hidden="true">
                  {getLanguageBadge(languagePreference())}
                </span>
                <span class="pm-name">{getLanguageSummaryText()}</span>
              </div>
              <span class="pm-chevron" aria-hidden="true">▾</span>
            </summary>

            <div class="pm-select__options" role="listbox">
              <For each={languageOptions}>
                {(lang) => (
                  <button
                    type="button"
                    class={`pm-option${lang === languagePreference() ? ' pm-option--selected' : ''}`}
                    onClick={() => {
                      handleLanguageChange(lang);
                    }}
                  >
                    <span class="pm-icon pm-icon--badge" aria-hidden="true">
                      {getLanguageBadge(lang)}
                    </span>
                    <span class="pm-name">{t(languageMessageKey[lang])}</span>
                    {lang === languagePreference() && <span class="pm-check" aria-hidden="true">✓</span>}
                  </button>
                )}
              </For>
            </div>
          </details>
        </div>

        <div class="settings-section">
          <label class="label">
            <span class="label-icon">📦</span>
            {t('selectPackageManager')}
          </label>
          
          <details class="pm-select" ref={packageManagerDetailsRef}>
            <summary class="pm-select__summary">
              <div class="pm-select__value">
                <img
                  class="pm-icon"
                  src={getIconUrl(selectedManager())}
                  alt=""
                  aria-hidden="true"
                />
                <span class="pm-name">{getSelectedPackageManager()?.name ?? selectedManager()}</span>
              </div>
              <span class="pm-chevron" aria-hidden="true">▾</span>
            </summary>

            <div class="pm-select__options" role="listbox">
              <For each={packageManagers}>
                {(pm) => (
                  <button
                    type="button"
                    class={`pm-option${pm.id === selectedManager() ? ' pm-option--selected' : ''}`}
                    onClick={() => {
                      setSelectedManager(pm.id);
                      closePackageManagerMenu();
                    }}
                  >
                    <img class="pm-icon" src={getIconUrl(pm.id)} alt="" aria-hidden="true" />
                    <span class="pm-name">{pm.name}</span>
                    {pm.id === selectedManager() && <span class="pm-check" aria-hidden="true">✓</span>}
                  </button>
                )}
              </For>
            </div>
          </details>
        </div>
      </div>

      <button class="save-button" onClick={handleSave} disabled={!hasChanges()}>
        {t('saveButton')}
      </button>

      {saved() && (
        <div class="success-message">
          ✓ {t('savedMessage')}
        </div>
      )}
    </div>
  );
}

export default App;
