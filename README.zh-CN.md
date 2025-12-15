# PyPI Copy Plus

[English](README.md)

一个浏览器扩展：在 `https://pypi.org/project/*` 页面，将默认的 `pip install <package>` 替换为你常用的 Python 依赖管理工具命令。

## 功能

- 支持 8 种工具：`pip`、`uv`、`Poetry`、`Pipenv`、`Conda`、`PDM`、`Rye`、`Hatch`
- 弹窗设置：主题（浅色/深色/跟随系统）、语言（自动/英文/简体/繁體）、包管理器选择（含图标）
- 即时更新：设置变更会通知所有已打开的 PyPI 标签页，无需刷新

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
- 可在弹窗中手动切换语言，设置会通过 `browser.storage.sync` 持久化。

## CI & 发布

GitHub Actions 工作流：`.github/workflows/ci.yml`

- PR / push `main`：类型检查，使用 `wxt zip` 生成 zip，并上传为 workflow artifacts。
- 推送标签 `v*`（如 `v1.1.0`）：生成 zip 并创建 GitHub Release，把 `.zip` 附加到 Release 资产中。
- 发布校验：`package.json` 的 `version` 必须与标签版本一致（不含 `v`）。

## 许可证

MIT

