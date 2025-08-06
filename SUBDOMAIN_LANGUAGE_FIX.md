# 子域名语言访问问题修复

## 问题描述

通过二级域名访问其他语言的首页时，显示的还是英文内容，而不是对应语言的内容。

## 问题原因

1. **Header组件中的logo链接硬编码**: `href="/"` 导致无论什么语言都跳转到根路径
2. **根路径页面语言检测不完整**: 子域名检测逻辑需要优化
3. **Vercel重写规则与页面逻辑不匹配**: 需要添加重定向逻辑

## 修复方案

### 1. 修复Header组件logo链接

**文件**: `src/components/common/layout/Header.astro`

```astro
---
import StaticMenu from './StaticMenu.astro';
import { themeConfig } from '../../../config/theme.js';
import { buildUrl } from '../../../lib/envConfig.js';

// 获取当前语言
const currentPath = Astro.url.pathname;
const langMatch = currentPath.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)\//);
const currentLang = langMatch ? langMatch[1] : 'en';

// 生成带语言的首页链接
const homeUrl = buildUrl(currentLang, '/');
---

<!-- 修复logo链接 -->
<a href={homeUrl} class="flex items-center">
```

### 2. 优化根路径页面语言检测

**文件**: `src/pages/index.astro`

```javascript
// 子域名到语言的映射
const subdomainToLang = {
  'zh': 'zh-CN',
  'zh-hant': 'zh-Hant',
  'de': 'de',
  'ja': 'ja',
  'fr': 'fr',
  'ar': 'ar',
  'es': 'es',
  'it': 'it',
  'pt': 'pt-pt',
  'nl': 'nl',
  'pl': 'pl',
  'ru': 'ru',
  'th': 'th',
  'id': 'id',
  'vi': 'vi',
  'ms': 'ms',
  'ml': 'ml',
  'my': 'my',
  'hi': 'hi',
  'ko': 'ko',
  'tr': 'tr'
};

// 检查子域名并设置语言
for (const [subdomain, language] of Object.entries(subdomainToLang)) {
  if (hostname.startsWith(`${subdomain}.`)) {
    lang = language;
    break;
  }
}

// 生产环境重定向逻辑
if (import.meta.env.PROD && hostname !== 'aihuazhi.cn' && hostname !== 'www.aihuazhi.cn') {
  const targetPath = `/${lang}${url === '/' ? '' : url}`;
  return Astro.redirect(targetPath);
}
```

### 3. 环境配置优化

**文件**: `src/lib/envConfig.js`

```javascript
// 构建URL
export const buildUrl = (lang, path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (isDevelopment) {
    // 本地开发模式：添加语言前缀
    return `/${lang}${cleanPath}`;
  } else {
    // 生产环境：子域名模式，直接返回路径
    return cleanPath;
  }
};
```

## 修复效果

### ✅ 修复前
- 访问 `zh.aihuazhi.cn` 显示英文内容
- Logo点击跳转到根路径，丢失语言信息
- 子域名检测不完整

### ✅ 修复后
- 访问 `zh.aihuazhi.cn` 自动重定向到 `/zh-CN`
- Logo点击保持在当前语言路径
- 完整的子域名语言映射

## 测试验证

### 本地开发环境
```bash
npm run dev
# 访问 http://localhost:3000/zh-CN 显示中文内容
```

### 生产环境（Vercel）
```
zh.aihuazhi.cn → 重定向到 /zh-CN → 显示中文内容
de.aihuazhi.cn → 重定向到 /de → 显示德语内容
ja.aihuazhi.cn → 重定向到 /ja → 显示日语内容
```

## 支持的语言子域名

| 子域名 | 语言 | 重定向路径 |
|--------|------|------------|
| `zh.aihuazhi.cn` | 简体中文 | `/zh-CN` |
| `zh-hant.aihuazhi.cn` | 繁体中文 | `/zh-Hant` |
| `de.aihuazhi.cn` | 德语 | `/de` |
| `ja.aihuazhi.cn` | 日语 | `/ja` |
| `fr.aihuazhi.cn` | 法语 | `/fr` |
| `ar.aihuazhi.cn` | 阿拉伯语 | `/ar` |
| `es.aihuazhi.cn` | 西班牙语 | `/es` |
| `it.aihuazhi.cn` | 意大利语 | `/it` |
| `pt.aihuazhi.cn` | 葡萄牙语 | `/pt-pt` |
| `nl.aihuazhi.cn` | 荷兰语 | `/nl` |
| `pl.aihuazhi.cn` | 波兰语 | `/pl` |
| `ru.aihuazhi.cn` | 俄语 | `/ru` |
| `th.aihuazhi.cn` | 泰语 | `/th` |
| `id.aihuazhi.cn` | 印尼语 | `/id` |
| `vi.aihuazhi.cn` | 越南语 | `/vi` |
| `ms.aihuazhi.cn` | 马来语 | `/ms` |
| `ml.aihuazhi.cn` | 马拉雅拉姆语 | `/ml` |
| `my.aihuazhi.cn` | 缅甸语 | `/my` |
| `hi.aihuazhi.cn` | 印地语 | `/hi` |
| `ko.aihuazhi.cn` | 韩语 | `/ko` |
| `tr.aihuazhi.cn` | 土耳其语 | `/tr` |
| `www.aihuazhi.cn` | 英语（默认） | `/en` |
| `aihuazhi.cn` | 英语（默认） | `/en` |

## 技术实现细节

### 1. 子域名检测
- 使用 `Astro.url.hostname` 获取当前主机名
- 通过 `startsWith()` 方法检测子域名前缀
- 映射表将子域名映射到对应的语言代码

### 2. 重定向逻辑
- 仅在生产环境启用重定向
- 主域名（`aihuazhi.cn` 和 `www.aihuazhi.cn`）不重定向
- 重定向到对应的语言路径

### 3. URL构建
- 本地开发：添加语言前缀 `/zh-CN/`
- 生产环境：子域名模式，直接使用路径 `/`

## 注意事项

1. **Vercel部署**: 确保vercel.json中的重写规则正确配置
2. **DNS设置**: 确保所有子域名都指向Vercel部署
3. **缓存清理**: 部署后可能需要清理浏览器缓存
4. **SSL证书**: 确保所有子域名都有有效的SSL证书

## 更新日志

- **2025-08-05**: 修复子域名语言访问问题
- 优化Header组件logo链接
- 完善根路径页面语言检测
- 添加生产环境重定向逻辑 