# PyPI Copy Plus

[English](README.md)

一个浏览器扩展：在 `https://pypi.org/project/*` 页面，将默认的 `pip install <package>` 替换为你常用的 Python 依赖管理工具命令。

## 预览

<video width="960" height="540" controls>
  <source src="./preview/preview.mp4?raw=true" type="video/mp4">
  您的浏览器不支持 HTML5 视频。
</video>

[直达链接：`preview/preview.mp4`](./preview/preview.mp4)

## 功能

- 支持 8 种工具：`pip`、`uv`、`Poetry`、`Pipenv`、`Conda`、`PDM`、`Rye`、`Hatch`
- 可选版本：安装命令旁新增版本下拉框，默认不带版本
- 弹窗设置 + 页面内面板：主题（浅色/深色/跟随系统）、语言（自动/英文/简体/繁體）、包管理器选择（含图标）
- 页面内悬浮设置按钮（可拖动），便于垂直标签页等场景快速配置
- 即时更新：设置变更会通知所有已打开的 PyPI 标签页，无需刷新

## 使用

### Chrome / Edge

1. 从 GitHub Releases 下载 `pypi-copy-plus-<版本>-chrome.zip` 并解压。
2. 打开 `chrome://extensions/`（Edge：`edge://extensions/`），开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择解压后的文件夹。

### Firefox

1. 从 GitHub Releases 下载 `pypi-copy-plus-<版本>-firefox.zip`。
2. 打开 `about:addons` → 右上角齿轮 → “从文件安装附加组件…”，选择该 zip。
   - 如果 Firefox 阻止未签名扩展，可使用 Firefox Developer/Nightly，或通过 `about:debugging#/runtime/this-firefox` 临时加载。

## 开发

依赖：Bun。

```bash
bun install
bun run dev           # Chrome/Edge
bun run dev:firefox   # Firefox
```

类型检查 / 构建 / 打包：

```bash
bun run compile
bun run build
bun run zip           # 使用 `wxt zip`
```

## 多语言（i18n）

- 默认语言为“自动”：读取 `browser.i18n.getUILanguage()`；无法识别时回退到英文。
- 可在弹窗或页面内面板中手动切换语言，设置会通过 `browser.storage.local` 持久化。

## CI & 发布

GitHub Actions 工作流：`.github/workflows/ci.yml`

- 推送标签 `v*`（如 `v1.1.0`）：使用 `wxt zip` 生成 zip 并创建 GitHub Release，把 `.zip` 附加到 Release 资产中（不包含 `*-sources.zip`）。
- 发布校验：`package.json` 的 `version` 必须与标签版本一致（不含 `v`）。

## 许可证

MIT
