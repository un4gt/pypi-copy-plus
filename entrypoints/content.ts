import { getPreferredPackageManager } from '@/utils/storage';
import { getPackageManager } from '@/utils/package-managers';

export default defineContentScript({
  matches: ['*://pypi.org/project/*'],
  main() {
    // 初始替换
    replacePipCommand();
    
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
