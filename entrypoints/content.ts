import {
  getPreferredPackageManager,
  setPreferredPackageManager,
  getTheme,
  setTheme,
  getLanguagePreference,
  setLanguagePreference,
  getFloatingButtonPosition,
  setFloatingButtonPosition,
  type Theme,
  type LanguagePreference,
  type FloatingButtonPosition,
} from '@/utils/storage';
import { getPackageManager, packageManagers } from '@/utils/package-managers';
import { resolveLanguage, translate } from '@/utils/i18n';

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

const FLOATING_UI_ROOT_ID = 'pypi-copy-plus-floating-root';
const DEFAULT_MARGIN_PX = 20;
const PANEL_GAP_PX = 12;

export default defineContentScript({
  matches: ['*://pypi.org/project/*'],
  main() {
    // 初始替换
    replacePipCommand();

    // 页面内悬浮设置按钮
    void initFloatingSettingsUi();
    
    // 监听来自 popup 的更新消息
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'UPDATE_COMMAND') {
        replacePipCommand();
      }
    });
  },
});

async function replacePipCommand() {
  const preferredManager = await getPreferredPackageManager();
  const pipCommandElement = document.getElementById('pip-command');
  
  if (!pipCommandElement) {
    return;
  }

  // 获取原始包名（优先从元素缓存/URL 提取，最后才从文本回退）
  let packageName = pipCommandElement.getAttribute('data-package-name')?.trim();
  if (!packageName) {
    packageName = getPackageNameFromUrl();
    if (packageName) {
      pipCommandElement.setAttribute('data-package-name', packageName);
    }
  }
  if (!packageName) {
    packageName = getPackageNameFromText(pipCommandElement.textContent || '');
    if (packageName) {
      pipCommandElement.setAttribute('data-package-name', packageName);
    }
  }
  if (!packageName) return;

  const packageManager = getPackageManager(preferredManager);
  if (!packageManager) {
    return;
  }

  const newCommand = packageManager.addCommand(packageName);
  pipCommandElement.textContent = newCommand;
  
  // 更新 clipboard 属性
  if (pipCommandElement.hasAttribute('data-clipboard-text')) {
    pipCommandElement.setAttribute('data-clipboard-text', newCommand);
  }
}

function getPackageNameFromUrl(): string | undefined {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments[0] !== 'project' || !segments[1]) return;
  try {
    return decodeURIComponent(segments[1]);
  } catch {
    return segments[1];
  }
}

function getPackageNameFromText(text: string): string | undefined {
  const match = text.match(
    /(?:pip install|uv add|poetry add|pipenv install|conda install|pdm add|rye add|hatch add)\s+(.+)/,
  );
  return match?.[1]?.trim();
}

async function initFloatingSettingsUi(): Promise<void> {
  if (document.getElementById(FLOATING_UI_ROOT_ID)) return;

  const host = document.createElement('div');
  host.id = FLOATING_UI_ROOT_ID;
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .pcp-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .pcp-overlay[data-theme="light"] {
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --bg-tertiary: #e9ecef;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --border-color: #dee2e6;
      --accent-color: #3776ab;
      --accent-hover: #2c5f8d;
      --success-bg: #d1e7dd;
      --success-text: #0f5132;
      --shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      --fab-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
      --fab-bg: var(--accent-color);
      --fab-bg-hover: var(--accent-hover);
    }

    .pcp-overlay[data-theme="dark"] {
      --bg-primary: #1a1d23;
      --bg-secondary: #22262e;
      --bg-tertiary: #2a2f38;
      --text-primary: #e9ecef;
      --text-secondary: #adb5bd;
      --border-color: #3a3f4b;
      --accent-color: #5b9bd5;
      --accent-hover: #4a8bc2;
      --success-bg: #1e4d2b;
      --success-text: #a3cfbb;
      --shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
      --fab-shadow: 0 10px 26px rgba(0, 0, 0, 0.38);
      --fab-bg: #2a2f38;
      --fab-bg-hover: #3a3f4b;
    }

    .pcp-fab {
      position: fixed;
      left: 0;
      top: 0;
      width: 46px;
      height: 46px;
      border-radius: 999px;
      border: none;
      background: var(--fab-bg);
      color: var(--text-primary);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--fab-shadow);
      transition: transform 0.12s ease, background-color 0.12s ease;
      z-index: 50;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    .pcp-fab:hover {
      background: var(--fab-bg-hover);
      transform: translateY(-1px);
    }

    .pcp-fab:active {
      transform: translateY(0);
    }

    .pcp-panel {
      position: fixed;
      top: 0;
      left: 0;
      width: min(380px, calc(100vw - 32px));
      z-index: 40;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      box-shadow: var(--shadow);
      pointer-events: auto;
      overflow: visible;
    }

    .pcp-panel[hidden] {
      display: none;
    }

    .pcp-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 14px 12px 14px;
      border-bottom: 1px solid var(--border-color);
      gap: 10px;
    }

    .pcp-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .pcp-theme {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.12s ease, border-color 0.12s ease, transform 0.12s ease;
      flex-shrink: 0;
      user-select: none;
      -webkit-user-select: none;
    }

    .pcp-theme:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-color);
      transform: scale(1.03);
    }

    .pcp-panel__body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .pcp-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pcp-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .pcp-label-icon {
      font-size: 15px;
    }

    .pcp-select {
      position: relative;
    }

    .pcp-select summary {
      list-style: none;
    }

    .pcp-select summary::-webkit-details-marker {
      display: none;
    }

    .pcp-select__summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      font-size: 13px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      outline: none;
      user-select: none;
      -webkit-user-select: none;
    }

    .pcp-select__summary:hover {
      border-color: var(--accent-color);
      background: var(--bg-tertiary);
    }

    .pcp-select[open] .pcp-select__summary {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(55, 118, 171, 0.12);
    }

    .pcp-select__value {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .pcp-icon {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .pcp-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .pcp-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pcp-chevron {
      margin-left: 12px;
      color: var(--text-secondary);
      transition: transform 0.15s ease;
    }

    .pcp-select[open] .pcp-chevron {
      transform: rotate(180deg);
    }

    .pcp-select__options {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      z-index: 30;
      max-height: 220px;
      max-width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 6px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      box-shadow: var(--shadow);
    }

    .pcp-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      transition: background-color 0.12s ease;
    }

    .pcp-option:hover {
      background: var(--bg-tertiary);
    }

    .pcp-option--selected {
      background: var(--bg-tertiary);
    }

    .pcp-check {
      margin-left: auto;
      color: var(--accent-color);
      font-weight: 900;
    }

    .pcp-save {
      width: 100%;
      padding: 11px 12px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
      color: white;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: transform 0.12s ease, opacity 0.12s ease;
      outline: none;
    }

    .pcp-save:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .pcp-save:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    .pcp-success {
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--success-bg);
      color: var(--success-text);
      text-align: center;
      font-size: 12px;
      font-weight: 600;
    }

    .pcp-select__options::-webkit-scrollbar {
      width: 8px;
    }

    .pcp-select__options::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: 4px;
    }

    .pcp-select__options::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    .pcp-select__options::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }
  `;

  const overlay = document.createElement('div');
  overlay.className = 'pcp-overlay';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pcp-fab';
  button.textContent = '⚙';

  const panel = document.createElement('div');
  panel.className = 'pcp-panel';
  panel.hidden = true;

  const panelHeader = document.createElement('div');
  panelHeader.className = 'pcp-panel__header';

  const title = document.createElement('h2');
  title.className = 'pcp-title';

  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'pcp-theme';

  panelHeader.append(title, themeButton);

  const panelBody = document.createElement('div');
  panelBody.className = 'pcp-panel__body';

  const languageSection = document.createElement('div');
  languageSection.className = 'pcp-section';
  const languageLabel = document.createElement('div');
  languageLabel.className = 'pcp-label';
  const languageLabelIcon = document.createElement('span');
  languageLabelIcon.className = 'pcp-label-icon';
  languageLabelIcon.textContent = '🌐';
  const languageLabelText = document.createElement('span');
  languageLabel.append(languageLabelIcon, languageLabelText);

  const languageDetails = document.createElement('details');
  languageDetails.className = 'pcp-select';
  const languageSummary = document.createElement('summary');
  languageSummary.className = 'pcp-select__summary';
  const languageSummaryValue = document.createElement('div');
  languageSummaryValue.className = 'pcp-select__value';
  const languageBadge = document.createElement('span');
  languageBadge.className = 'pcp-badge';
  const languageSummaryName = document.createElement('span');
  languageSummaryName.className = 'pcp-name';
  languageSummaryValue.append(languageBadge, languageSummaryName);
  const languageChevron = document.createElement('span');
  languageChevron.className = 'pcp-chevron';
  languageChevron.setAttribute('aria-hidden', 'true');
  languageChevron.textContent = '▾';
  languageSummary.append(languageSummaryValue, languageChevron);
  const languageOptionsContainer = document.createElement('div');
  languageOptionsContainer.className = 'pcp-select__options';
  languageOptionsContainer.setAttribute('role', 'listbox');
  languageDetails.append(languageSummary, languageOptionsContainer);

  languageSection.append(languageLabel, languageDetails);

  const managerSection = document.createElement('div');
  managerSection.className = 'pcp-section';
  const managerLabel = document.createElement('div');
  managerLabel.className = 'pcp-label';
  const managerLabelIcon = document.createElement('span');
  managerLabelIcon.className = 'pcp-label-icon';
  managerLabelIcon.textContent = '📦';
  const managerLabelText = document.createElement('span');
  managerLabel.append(managerLabelIcon, managerLabelText);

  const managerDetails = document.createElement('details');
  managerDetails.className = 'pcp-select';
  const managerSummary = document.createElement('summary');
  managerSummary.className = 'pcp-select__summary';
  const managerSummaryValue = document.createElement('div');
  managerSummaryValue.className = 'pcp-select__value';
  const managerIcon = document.createElement('img');
  managerIcon.className = 'pcp-icon';
  managerIcon.alt = '';
  managerIcon.setAttribute('aria-hidden', 'true');
  const managerSummaryName = document.createElement('span');
  managerSummaryName.className = 'pcp-name';
  managerSummaryValue.append(managerIcon, managerSummaryName);
  const managerChevron = document.createElement('span');
  managerChevron.className = 'pcp-chevron';
  managerChevron.setAttribute('aria-hidden', 'true');
  managerChevron.textContent = '▾';
  managerSummary.append(managerSummaryValue, managerChevron);
  const managerOptionsContainer = document.createElement('div');
  managerOptionsContainer.className = 'pcp-select__options';
  managerOptionsContainer.setAttribute('role', 'listbox');
  managerDetails.append(managerSummary, managerOptionsContainer);

  managerSection.append(managerLabel, managerDetails);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'pcp-save';
  saveButton.disabled = true;

  const successMessage = document.createElement('div');
  successMessage.className = 'pcp-success';
  successMessage.hidden = true;

  panelBody.append(languageSection, managerSection, saveButton, successMessage);
  panel.append(panelHeader, panelBody);

  overlay.append(button, panel);
  shadow.append(style, overlay);
  document.documentElement.append(host);

  let selectedManager = 'pip';
  let savedManager = 'pip';
  let languagePreference: LanguagePreference = 'auto';
  let savedLanguagePreference: LanguagePreference = 'auto';
  let currentTheme: Theme = 'system';

  const resolvedLanguage = () => resolveLanguage(languagePreference);
  const t = (key: string) => translate(resolvedLanguage(), key);

  const getThemeIcon = () => {
    if (currentTheme === 'light') return '☀️';
    if (currentTheme === 'dark') return '🌙';
    return '🔄';
  };

  const getLanguageBadge = (language: LanguagePreference) => {
    if (language === 'en') return 'EN';
    if (language === 'zh') return '简';
    if (language === 'zh_TW') return '繁';
    return 'A';
  };

  const getIconUrl = (id: string) => {
    return packageManagerIcons[id] ?? pipIconUrl;
  };

  const hasChanges = () => selectedManager !== savedManager || languagePreference !== savedLanguagePreference;

  const updateSaveButtonState = () => {
    saveButton.disabled = !hasChanges();
  };

  const closeMenus = () => {
    languageDetails.open = false;
    managerDetails.open = false;
  };

  const updateDropdownPlacement = (
    detailsElement: HTMLDetailsElement,
    summaryElement: HTMLElement,
    optionsElement: HTMLElement,
  ) => {
    if (!detailsElement.open) return;
    const margin = 12;
    const summaryRect = summaryElement.getBoundingClientRect();
    const availableBelow = window.innerHeight - summaryRect.bottom - margin;
    const availableAbove = summaryRect.top - margin;
    const openUp = availableAbove > availableBelow;
    const space = openUp ? availableAbove : availableBelow;

    optionsElement.style.maxHeight = `${clamp(space, 0, 220)}px`;
    if (openUp) {
      optionsElement.style.top = 'auto';
      optionsElement.style.bottom = 'calc(100% + 8px)';
      return;
    }

    optionsElement.style.bottom = 'auto';
    optionsElement.style.top = 'calc(100% + 8px)';
  };

  const updateText = () => {
    const lang = resolvedLanguage();
    overlay.lang = lang === 'zh_TW' ? 'zh-TW' : lang;

    title.textContent = t('settingsTitle');
    button.title = t('settingsTitle');
    button.setAttribute('aria-label', t('settingsTitle'));

    managerLabelText.textContent = t('selectPackageManager');
    languageLabelText.textContent = t('selectLanguage');
    saveButton.textContent = t('saveButton');
    successMessage.textContent = `✓ ${t('savedMessage')}`;

    themeButton.textContent = getThemeIcon();
    themeButton.title = `${t('selectTheme')}: ${t(themeMessageKey[currentTheme])}`;

    languageBadge.textContent = getLanguageBadge(languagePreference);
    if (languagePreference !== 'auto') {
      languageSummaryName.textContent = t(languageMessageKey[languagePreference]);
    } else {
      languageSummaryName.textContent = `${t(languageMessageKey.auto)} (${t(languageMessageKey[lang])})`;
    }

    const selectedPm = getPackageManager(selectedManager);
    managerIcon.src = getIconUrl(selectedManager);
    managerSummaryName.textContent = selectedPm?.name ?? selectedManager;

    for (const optionButton of languageOptionsContainer.querySelectorAll<HTMLButtonElement>('button[data-lang]')) {
      const langOption = optionButton.dataset.lang as LanguagePreference | undefined;
      const label = optionButton.querySelector<HTMLElement>('[data-label]');
      if (langOption && label) label.textContent = t(languageMessageKey[langOption]);
    }
  };

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const applyTheme = () => {
    const resolvedTheme = currentTheme === 'system' ? (media?.matches ? 'dark' : 'light') : currentTheme;
    overlay.dataset.theme = resolvedTheme;
  };

  media?.addEventListener?.('change', applyTheme);
  media?.addListener?.(applyTheme);

  const loadInitialState = async () => {
    const [preferred, theme, language, storedPosition] = await Promise.all([
      getPreferredPackageManager(),
      getTheme(),
      getLanguagePreference(),
      getFloatingButtonPosition(),
    ]);

    selectedManager = preferred;
    savedManager = preferred;
    currentTheme = theme;
    languagePreference = language;
    savedLanguagePreference = language;

    applyTheme();
    buildLanguageOptions();
    buildManagerOptions();
    updateText();
    updateSaveButtonState();
    applyInitialPosition(storedPosition);
  };

  const buildLanguageOptions = () => {
    languageOptionsContainer.replaceChildren();
    for (const lang of languageOptions) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'pcp-option';
      option.dataset.lang = lang;

      const badge = document.createElement('span');
      badge.className = 'pcp-badge';
      badge.textContent = getLanguageBadge(lang);

      const name = document.createElement('span');
      name.className = 'pcp-name';
      name.dataset.label = 'true';
      name.textContent = t(languageMessageKey[lang]);

      const check = document.createElement('span');
      check.className = 'pcp-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';

      option.append(badge, name);
      if (lang === languagePreference) {
        option.classList.add('pcp-option--selected');
        option.append(check);
      }

      option.addEventListener('click', () => {
        successMessage.hidden = true;
        languagePreference = lang;
        closeMenus();
        buildLanguageOptions();
        updateText();
        updateSaveButtonState();
      });

      languageOptionsContainer.append(option);
    }
  };

  languageDetails.addEventListener('toggle', () => {
    updateDropdownPlacement(languageDetails, languageSummary, languageOptionsContainer);
  });

  const buildManagerOptions = () => {
    managerOptionsContainer.replaceChildren();
    for (const pm of packageManagers) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'pcp-option';

      const icon = document.createElement('img');
      icon.className = 'pcp-icon';
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
      icon.src = getIconUrl(pm.id);

      const name = document.createElement('span');
      name.className = 'pcp-name';
      name.textContent = pm.name;

      const check = document.createElement('span');
      check.className = 'pcp-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';

      option.append(icon, name);
      if (pm.id === selectedManager) {
        option.classList.add('pcp-option--selected');
        option.append(check);
      }

      option.addEventListener('click', () => {
        successMessage.hidden = true;
        selectedManager = pm.id;
        closeMenus();
        buildManagerOptions();
        updateText();
        updateSaveButtonState();
      });

      managerOptionsContainer.append(option);
    }
  };

  managerDetails.addEventListener('toggle', () => {
    updateDropdownPlacement(managerDetails, managerSummary, managerOptionsContainer);
  });

  const resetSelectionsToSaved = () => {
    selectedManager = savedManager;
    languagePreference = savedLanguagePreference;
    buildLanguageOptions();
    buildManagerOptions();
    updateText();
    updateSaveButtonState();
  };

  const positionPanelFromButtonCenter = () => {
    const buttonRect = button.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    const anchorX = buttonRect.right + PANEL_GAP_PX;
    const anchorY = buttonRect.bottom + PANEL_GAP_PX;

    const panelRect = panel.getBoundingClientRect();
    const panelWidth = panelRect.width;
    const panelHeight = panelRect.height;
    const margin = 16;

    if (!panelWidth || !panelHeight) {
      panel.style.left = `${margin}px`;
      panel.style.top = `${margin}px`;
      panel.style.transformOrigin = '0 0';
      return;
    }

    let left = anchorX;
    let top = anchorY;

    const maxLeft = Math.max(margin, window.innerWidth - panelWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - panelHeight - margin);
    left = clamp(left, margin, maxLeft);
    top = clamp(top, margin, maxTop);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;

    const originX = clamp(buttonCenterX - left, 0, panelWidth);
    const originY = clamp(buttonCenterY - top, 0, panelHeight);
    panel.style.transformOrigin = `${originX}px ${originY}px`;
  };

  const openPanel = () => {
    successMessage.hidden = true;
    closeMenus();
    resetSelectionsToSaved();

    panel.style.visibility = 'hidden';
    panel.hidden = false;

    window.requestAnimationFrame(() => {
      positionPanelFromButtonCenter();
      panel.style.visibility = '';
    });
  };

  const closePanel = () => {
    successMessage.hidden = true;
    closeMenus();
    resetSelectionsToSaved();
    panel.hidden = true;
  };

  const togglePanel = () => {
    if (panel.hidden) {
      openPanel();
      return;
    }
    closePanel();
  };

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (panel.hidden) return;
      const path = event.composedPath();
      if (path.includes(panel) || path.includes(button)) return;
      closePanel();
    },
    { capture: true },
  );

  themeButton.addEventListener('click', async () => {
    const themes: Theme[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    currentTheme = themes[(currentIndex + 1) % themes.length];
    await setTheme(currentTheme);
    applyTheme();
    updateText();
  });

  saveButton.addEventListener('click', async () => {
    if (!hasChanges()) return;

    if (selectedManager !== savedManager) {
      await setPreferredPackageManager(selectedManager);
      savedManager = selectedManager;
    }

    if (languagePreference !== savedLanguagePreference) {
      await setLanguagePreference(languagePreference);
      savedLanguagePreference = languagePreference;
    }

    updateSaveButtonState();
    successMessage.hidden = false;
    window.setTimeout(() => {
      successMessage.hidden = true;
    }, 2000);
  });

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  const getButtonSize = () => {
    return { width: button.offsetWidth || 46, height: button.offsetHeight || 46 };
  };

  const clampPosition = (position: FloatingButtonPosition) => {
    const { width: buttonWidth, height: buttonHeight } = getButtonSize();
    const maxX = Math.max(0, window.innerWidth - buttonWidth);
    const maxY = Math.max(0, window.innerHeight - buttonHeight);
    return { x: clamp(position.x, 0, maxX), y: clamp(position.y, 0, maxY) };
  };

  const setButtonPosition = (position: FloatingButtonPosition) => {
    button.style.left = `${position.x}px`;
    button.style.top = `${position.y}px`;
  };

  const applyInitialPosition = (stored: FloatingButtonPosition | undefined) => {
    const apply = (position: FloatingButtonPosition) => setButtonPosition(clampPosition(position));
    if (stored) {
      if (typeof stored.viewportWidth === 'number' && typeof stored.viewportHeight === 'number') {
        const { width: buttonWidth, height: buttonHeight } = getButtonSize();
        const prevAvailableWidth = Math.max(1, stored.viewportWidth - buttonWidth);
        const prevAvailableHeight = Math.max(1, stored.viewportHeight - buttonHeight);
        const nextAvailableWidth = Math.max(0, window.innerWidth - buttonWidth);
        const nextAvailableHeight = Math.max(0, window.innerHeight - buttonHeight);
        const ratioX = clamp(stored.x / prevAvailableWidth, 0, 1);
        const ratioY = clamp(stored.y / prevAvailableHeight, 0, 1);
        apply({ x: ratioX * nextAvailableWidth, y: ratioY * nextAvailableHeight });
        return;
      }

      const clamped = clampPosition(stored);
      setButtonPosition(clamped);
      void setFloatingButtonPosition({
        x: clamped.x,
        y: clamped.y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      return;
    }

    window.requestAnimationFrame(() => {
      apply({ x: DEFAULT_MARGIN_PX, y: DEFAULT_MARGIN_PX });
    });
  };

  let pointerDown = false;
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let dragged = false;
  let lastViewportWidth = window.innerWidth;
  let lastViewportHeight = window.innerHeight;

  button.addEventListener('pointerdown', (event) => {
    pointerDown = true;
    pointerId = event.pointerId;
    dragged = false;
    startX = event.clientX;
    startY = event.clientY;
    const rect = button.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    button.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  button.addEventListener('pointermove', (event) => {
    if (!pointerDown || pointerId !== event.pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragged && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      dragged = true;
    }
    if (!dragged) return;

    const next = clampPosition({ x: startLeft + dx, y: startTop + dy });
    setButtonPosition(next);
  });

  button.addEventListener('pointerup', async (event) => {
    if (!pointerDown || pointerId !== event.pointerId) return;
    pointerDown = false;
    pointerId = null;
    button.releasePointerCapture?.(event.pointerId);

    if (!dragged) {
      togglePanel();
      return;
    }

    const rect = button.getBoundingClientRect();
    await setFloatingButtonPosition({
      x: rect.left,
      y: rect.top,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  });

  window.addEventListener('resize', () => {
    if (pointerDown) return;
    const rect = button.getBoundingClientRect();
    const { width: buttonWidth, height: buttonHeight } = getButtonSize();
    const prevAvailableWidth = Math.max(1, lastViewportWidth - buttonWidth);
    const prevAvailableHeight = Math.max(1, lastViewportHeight - buttonHeight);
    const ratioX = clamp(rect.left / prevAvailableWidth, 0, 1);
    const ratioY = clamp(rect.top / prevAvailableHeight, 0, 1);

    lastViewportWidth = window.innerWidth;
    lastViewportHeight = window.innerHeight;
    const nextAvailableWidth = Math.max(0, lastViewportWidth - buttonWidth);
    const nextAvailableHeight = Math.max(0, lastViewportHeight - buttonHeight);
    setButtonPosition(clampPosition({ x: ratioX * nextAvailableWidth, y: ratioY * nextAvailableHeight }));

    if (languageDetails.open) {
      updateDropdownPlacement(languageDetails, languageSummary, languageOptionsContainer);
    }
    if (managerDetails.open) {
      updateDropdownPlacement(managerDetails, managerSummary, managerOptionsContainer);
    }
    if (!panel.hidden) {
      window.requestAnimationFrame(positionPanelFromButtonCenter);
    }
  });

  await loadInitialState();
  lastViewportWidth = window.innerWidth;
  lastViewportHeight = window.innerHeight;
}
