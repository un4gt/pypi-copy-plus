# 贡献指南 / Contributing Guide

## 添加新的包管理工具

编辑 `utils/package-managers.ts`，在 `packageManagers` 数组中添加：

```typescript
{
  id: 'tool-name',
  name: 'Tool Name',
  addCommand: (pkg) => `tool add ${pkg}`,
}
```

## 添加新语言

新增/更新语言时，需要同时维护两处：

- `public/_locales/<locale>/messages.json`：浏览器扩展原生 i18n（`browser.i18n`）与扩展元数据使用
- `src/_locales/<locale>/messages.json`：弹窗内“手动切换语言”功能使用（可被 JS 导入）

例如新增 `ja`：分别在 `public/_locales/ja/` 与 `src/_locales/ja/` 下创建 `messages.json`，复制 `en/messages.json` 并翻译所有 `message` 字段。

## 开发

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build
```

## 提交

- 确保代码通过类型检查：`bun run compile`
- 提供清晰的提交信息
- 说明改动的目的和影响
