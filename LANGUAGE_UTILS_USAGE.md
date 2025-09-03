# 语言工具类使用说明

## 概述

`src/utils/languageUtils.js` 是一个专门处理多语言相关功能的工具类，将原来分散在各个组件中的语言检测和URL构建逻辑进行了统一封装。

## 主要功能

### 1. 获取当前语言

```javascript
import { getCurrentLanguage } from '@utils/languageUtils';

// 从路径和主机名获取当前语言
const currentLang = getCurrentLanguage(Astro.url.pathname, Astro.url.hostname);
```

**功能说明：**
- 优先从URL路径中获取语言代码（如 `/zh/about` 中的 `zh`）
- 其次从子域名获取语言代码（如 `zh.example.com` 中的 `zh`）
- 默认返回英语 `'en'`

**支持的语言格式：**
- 双字母代码：`en`, `zh`, `ja`, `de`, `ar`, `ru` 等
- 带地区代码：`zh-Hans`, `zh-Hant` 等

### 2. 构建多语言URL

```javascript
import { buildLanguageUrl } from '@utils/languageUtils';

// 构建带语言前缀的URL
const homeUrl = buildLanguageUrl('zh', '/');
// 结果: /zh/

const aboutUrl = buildLanguageUrl('ja', '/about');
// 结果: /ja/about

// 所有语言都添加前缀
const enHomeUrl = buildLanguageUrl('en', '/');
// 结果: /en/
```

**规则：**
- 所有语言都会添加语言前缀，保持URL结构的一致性

### 3. 语言路径工具函数

```javascript
import { 
  removeLanguagePrefix, 
  hasLanguagePrefix
} from '@utils/languageUtils';

// 移除语言前缀
const pathWithoutLang = removeLanguagePrefix('/zh/about');
// 结果: /about

// 检查是否包含语言前缀
const hasPrefix = hasLanguagePrefix('/zh/about');
// 结果: true
```

## 使用示例

### 在 Astro 组件中使用

```astro
---
import { getCurrentLanguage, buildLanguageUrl } from '@utils/languageUtils';

// 获取当前语言
const currentLang = getCurrentLanguage(Astro.url.pathname, Astro.url.hostname);

// 构建多语言链接
const homeUrl = buildLanguageUrl(currentLang, '/');
const aboutUrl = buildLanguageUrl(currentLang, '/about');
---

<a href={homeUrl}>首页</a>
<a href={aboutUrl}>关于我们</a>
```

### 在 JavaScript 中使用

```javascript
import { getCurrentLanguage, buildLanguageUrl, removeLanguagePrefix } from '@utils/languageUtils';

// 获取当前语言
const currentLang = getCurrentLanguage(window.location.pathname, window.location.hostname);

// 构建语言切换URL
function switchLanguage(newLang) {
  const currentPath = window.location.pathname;
  const pathWithoutLang = removeLanguagePrefix(currentPath);
  const newUrl = buildLanguageUrl(newLang, pathWithoutLang);
  window.location.href = newUrl;
}
```

## 已更新的组件

以下组件已经更新为使用新的语言工具类：

1. `src/components/Custom/Layout/Header.astro`
2. `src/components/Custom/Layout/Menu.astro`
3. `src/components/common/layout/Header.astro`
4. `src/components/common/layout/StaticMenu.astro`

## 优势

1. **代码复用**：避免在多个组件中重复相同的语言检测逻辑
2. **维护性**：语言相关的逻辑集中在一个文件中，便于维护和更新
3. **一致性**：确保所有组件使用相同的语言检测和URL构建逻辑
4. **轻量化**：只保留核心功能，没有冗余的死数据
5. **性能优化**：减少不必要的计算和内存占用

## 注意事项

1. 确保在导入时使用正确的路径：`@utils/languageUtils`
2. 所有语言都会添加语言前缀，保持URL结构的一致性
3. 所有函数都有完整的JSDoc注释，支持IDE智能提示
4. 语言支持列表由实际使用的组件动态获取，不在此工具类中硬编码

## 核心函数说明

- `getCurrentLanguage(pathname, hostname)`: 获取当前语言代码
- `buildLanguageUrl(lang, path, baseUrl)`: 构建多语言URL
- `removeLanguagePrefix(pathname)`: 移除语言前缀
- `hasLanguagePrefix(pathname)`: 检查是否包含语言前缀
