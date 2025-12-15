# GitHub Actions Workflow

## ci.yml - 统一的 CI/CD

这是一个统一的 CI/CD workflow，根据触发条件自动执行不同的任务（打包使用 WXT 官方命令 `wxt zip`）。

### 触发条件

1. **推送标签 (`v*`)** - 自动发布到 GitHub Release

### 执行流程

#### 自动发布（标签 `v*`）
```
1. 类型检查（tsc）
2. 校验版本号：package.json.version 必须与 tag 版本一致（不含 v）
3. 打包 zip（wxt zip：Chrome/Edge + Firefox）
4. 收集 Release 资产（复制到 `release-assets/`，不包含 `*-sources.zip`）
5. 创建 GitHub Release 并上传 zip（`release-assets/*.zip`）
```

### 使用方法

**触发 CI 测试：**
```bash
# 本仓库不在 push/PR 时运行 workflow
```

**触发自动发布：**
```bash
# 先更新 package.json version 与 CHANGELOG.md，再打 tag
git tag v1.0.0
git push origin v1.0.0
```

### 查看结果

访问：`https://github.com/YOUR_USERNAME/pypi-copy-plus/actions`

### 优势

- ✅ 单一 workflow，易于维护
- ✅ 自动区分测试和发布
- ✅ 减少重复配置
- ✅ 统一的构建流程
