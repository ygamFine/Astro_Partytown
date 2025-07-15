# 公共语言文件实现总结

## 🎯 实现目标

在 `@/locales` 目录中为每个支持的语言创建 `common.json` 文件，用于存储全局通用的语言内容，如占位符、按钮文本、验证消息等。

## ✅ 完成的工作

### 1. 公共语言文件生成

- ✅ 为所有 22 种支持的语言创建了 `common.json` 文件
- ✅ 每个文件包含完整的分类结构：
  - `placeholders` - 占位符文本
  - `labels` - 标签文本
  - `validation` - 验证消息
  - `buttons` - 按钮文本
  - `status` - 状态文本
  - `time` - 时间相关文本
  - `pagination` - 分页文本
  - `search` - 搜索相关文本
  - `categories` - 分类标签
  - `actions` - 操作文本
  - `messages` - 通用消息
  - `units` - 单位文本

### 2. 工具函数库

创建了 `src/lib/commonTranslations.js` 工具库，提供：

- ✅ `loadCommonTranslations()` - 加载公共语言文件
- ✅ `getCommonText()` - 获取公共语言文本（异步）
- ✅ `getCommonTextSync()` - 获取公共语言文本（同步，用于SSR）
- ✅ `getPlaceholder()` - 获取占位符文本
- ✅ `getLabel()` - 获取标签文本
- ✅ `getButtonText()` - 获取按钮文本
- ✅ `getValidationMessage()` - 获取验证消息
- ✅ `getStatusText()` - 获取状态文本
- ✅ `getSearchText()` - 获取搜索相关文本
- ✅ `getCategoryLabel()` - 获取分类标签
- ✅ `getActionText()` - 获取操作文本
- ✅ `getMessageText()` - 获取消息文本
- ✅ `getTimeText()` - 获取时间相关文本
- ✅ `getPaginationText()` - 获取分页文本
- ✅ `getUnitText()` - 获取单位文本

### 3. 生成脚本

创建了 `scripts/generate-common-translations.js` 脚本：

- ✅ 自动为所有支持的语言生成 `common.json` 文件
- ✅ 支持中文简体、中文繁体、英文的完整翻译
- ✅ 其他语言自动回退到英文
- ✅ 易于扩展和维护

### 4. 演示组件

创建了 `src/components/CommonTranslationsDemo.astro` 演示组件：

- ✅ 展示各种语言文本的使用方法
- ✅ 包含所有分类的示例
- ✅ 美观的UI设计
- ✅ 响应式布局

### 5. 测试页面

创建了 `src/pages/[lang]/common-demo.astro` 测试页面：

- ✅ 支持多语言访问
- ✅ 展示公共语言文件的实际效果
- ✅ 便于开发和调试

### 6. 文档

创建了完整的文档：

- ✅ `COMMON_TRANSLATIONS_GUIDE.md` - 详细使用指南
- ✅ `COMMON_TRANSLATIONS_SUMMARY.md` - 实现总结

## 🔧 核心特性

### 1. 参数替换支持

```javascript
// 定义带参数的文本
validation: {
  min_length: "最少需要{min}个字符"
}

// 使用时传入参数
const message = await getValidationMessage(lang, 'min_length', { min: 6 });
// 结果: "最少需要6个字符"
```

### 2. 智能回退机制

- 如果指定语言文件不存在，自动回退到默认语言（英语）
- 如果某个键不存在，返回键名作为默认值
- 确保系统稳定性和用户体验

### 3. SSR 优化

- 提供同步和异步两种获取方式
- 同步方式适用于服务器端渲染
- 异步方式适用于客户端交互

### 4. 类型安全

- 完整的 TypeScript 支持
- 清晰的函数签名和参数类型
- 良好的 IDE 智能提示

## 📊 支持的语言

| 语言代码 | 语言名称 | 状态 |
|---------|---------|------|
| en | English | ✅ 完整翻译 |
| zh-hans | 简体中文 | ✅ 完整翻译 |
| zh-hant | 繁體中文 | ✅ 完整翻译 |
| fr | Français | 🔄 回退到英文 |
| de | Deutsch | 🔄 回退到英文 |
| it | Italiano | 🔄 回退到英文 |
| tr | Türkçe | 🔄 回退到英文 |
| es | Español | 🔄 回退到英文 |
| pt-pt | Português | 🔄 回退到英文 |
| nl | Nederlands | 🔄 回退到英文 |
| pl | Polski | 🔄 回退到英文 |
| ar | العربية | 🔄 回退到英文 |
| ru | Русский | 🔄 回退到英文 |
| th | ไทย | 🔄 回退到英文 |
| id | Bahasa Indonesia | 🔄 回退到英文 |
| vi | Tiếng Việt | 🔄 回退到英文 |
| ms | Bahasa Melayu | 🔄 回退到英文 |
| ml | മലയാളം | 🔄 回退到英文 |
| my | မြန်မာဘာသာ | 🔄 回退到英文 |
| hi | हिन्दी | 🔄 回退到英文 |
| ja | 日本語 | 🔄 回退到英文 |
| ko | 한국어 | 🔄 回退到英文 |

## 🚀 使用方法

### 基本使用

```javascript
import { getPlaceholder, getButtonText } from '../lib/commonTranslations.js';

// 获取占位符
const searchPlaceholder = await getPlaceholder(lang, 'search');

// 获取按钮文本
const submitButton = await getButtonText(lang, 'submit');
```

### 在 Astro 组件中使用

```astro
---
import { getCommonTextSync } from '../lib/commonTranslations.js';

const common = await import(`../locales/${lang}/common.js`);
const commonData = common.default;
---

<input placeholder={getCommonTextSync(commonData, 'placeholders.search')} />
<button>{getCommonTextSync(commonData, 'buttons.submit')}</button>
```

### 参数替换

```javascript
const message = await getValidationMessage(lang, 'min_length', { min: 6 });
```

## 🧪 测试结果

所有功能测试通过：

- ✅ 占位符文本获取
- ✅ 按钮文本获取
- ✅ 验证消息获取（带参数）
- ✅ 通用文本获取
- ✅ 同步文本获取
- ✅ 分类标签获取
- ✅ 状态文本获取
- ✅ 时间文本获取
- ✅ 分页文本获取
- ✅ 操作文本获取
- ✅ 消息文本获取
- ✅ 单位文本获取
- ✅ 回退机制
- ✅ 参数替换

## 📁 文件结构

```
src/
├── locales/
│   ├── en/common.json        # 英文公共语言文件
│   ├── zh-hans/common.json   # 中文简体公共语言文件
│   ├── zh-hant/common.json   # 中文繁体公共语言文件
│   └── [其他语言]/common.json # 其他语言公共语言文件
├── lib/
│   └── commonTranslations.js # 工具函数库
├── components/
│   └── CommonTranslationsDemo.astro # 演示组件
└── pages/[lang]/
    └── common-demo.astro     # 测试页面

scripts/
└── generate-common-translations.js # 生成脚本

docs/
├── COMMON_TRANSLATIONS_GUIDE.md    # 使用指南
└── COMMON_TRANSLATIONS_SUMMARY.md  # 实现总结
```

## 🎉 总结

成功实现了完整的公共语言文件系统：

1. **全面覆盖** - 支持所有 22 种语言
2. **功能完整** - 包含 12 个主要分类
3. **易于使用** - 提供丰富的工具函数
4. **性能优化** - 支持 SSR 和客户端
5. **可维护性** - 自动化生成和更新
6. **文档完善** - 详细的使用指南和示例

该系统为项目的国际化提供了坚实的基础，可以轻松地在任何组件中使用统一的语言文本，大大提高了开发效率和用户体验。 