# 语言配置动态化更新

## 概述

本次更新将项目中硬编码的语言配置改为动态获取，避免在代码中写死语言列表。

## 主要更改

### 1. 创建统一的语言配置管理

- **文件**: `src/lib/languageConfig.js`
- **功能**: 提供统一的语言配置管理，包括：
  - 动态获取支持的语言列表
  - 获取默认语言
  - 检查 RTL 语言
  - 获取语言显示名称

### 2. 更新 Astro 配置

- **文件**: `astro.config.mjs`
- **更改**: 将硬编码的语言列表改为从 `languageConfig.js` 动态获取
- **优先级**: 
  1. 环境变量 `ENABLED_LANGUAGES`
  2. Strapi API `/api/i18n/locales`
  3. 默认语言列表

### 3. 更新翻译文件

- **文件**: `src/i18n/dictionaries.ts`
- **更改**: 移除硬编码的语言列表，使用统一的语言配置

### 4. 更新路由生成

- **文件**: `src/lib/i18n-routes.js`
- **更改**: 使用统一的语言配置，简化代码逻辑

### 5. 更新图片下载脚本

- **文件**: `scripts/download-strapi-images.js`
- **更改**: 使用统一的语言配置，避免重复代码

## 配置优先级

1. **环境变量**: `ENABLED_LANGUAGES=zh-CN,en,fr`
2. **API 获取**: 从 Strapi `/api/i18n/locales` 接口获取
3. **默认回退**: 完整的语言列表作为最终回退

## 使用方法

### 设置环境变量（推荐）

```bash
# .env 文件
ENABLED_LANGUAGES=zh-CN,en,fr,de,ja
```

### 不设置环境变量

如果不设置 `ENABLED_LANGUAGES`，系统会自动从 Strapi API 获取支持的语言列表。

### 回退机制

如果 API 获取失败，系统会使用默认的完整语言列表：
```
en, zh-CN, zh-Hant, fr, de, it, tr, es, pt-pt, nl, pl, ar, ru, th, id, vi, ms, ml, my, hi, ja, ko
```

## 优势

1. **灵活性**: 可以通过环境变量或 API 动态控制支持的语言
2. **维护性**: 统一的语言配置管理，避免重复代码
3. **可扩展性**: 新增语言只需在 Strapi 后台配置，无需修改代码
4. **回退机制**: 多层回退确保系统稳定性

## 注意事项

1. 确保 Strapi API 的 `STRAPI_STATIC_URL` 和 `STRAPI_TOKEN` 环境变量正确配置
2. 如果使用环境变量 `ENABLED_LANGUAGES`，请确保语言代码格式正确（逗号分隔）
3. 默认语言始终为 `en`，不建议修改

## 测试

建议在不同配置下测试：

1. 设置 `ENABLED_LANGUAGES` 环境变量
2. 不设置环境变量，依赖 API 获取
3. 模拟 API 失败，验证回退机制

## 相关文件

- `src/lib/languageConfig.js` - 统一语言配置
- `astro.config.mjs` - Astro 配置
- `src/i18n/dictionaries.ts` - 翻译文件
- `src/lib/i18n-routes.js` - 路由生成
- `scripts/download-strapi-images.js` - 图片下载脚本
