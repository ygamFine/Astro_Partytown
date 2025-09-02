# 网站配置数据全局共享方案

## 概述

本方案通过在根布局组件（`Layout.astro`）中调用 `getSiteConfiguration` 接口，获取网站配置数据，然后通过 props 传递给所有子组件，实现全局数据共享。

## 实现方式

### 1. 在 Layout 中获取数据

```astro
---
// src/layouts/Layout.astro
import { getSiteConfiguration } from "../apis/common.js";

// 获取网站配置信息
let siteConfiguration = {};
try {
  siteConfiguration = await getSiteConfiguration(lang);
} catch (error) {
  console.error('获取网站配置失败:', error);
  siteConfiguration = {};
}
---

<!-- 将数据传递给子组件 -->
<Header siteConfiguration={siteConfiguration} />
<FooterSection siteConfiguration={siteConfiguration} />
```

### 2. 在子组件中接收数据

```astro
---
// src/components/Custom/Layout/Header.astro
export interface Props {
  siteConfiguration?: any;
}

const { siteConfiguration = {} } = Astro.props;

// 从网站配置中提取联系信息
const contactInfo = siteConfiguration.attributes?.contactInfo || {};
const phone1 = contactInfo.phone1 || '+86 156 2892 0918';
const phone2 = contactInfo.phone2 || '+86 183 5318 1619';
const email = contactInfo.email || 'tevis@yonancn.com';
---
```

### 3. 在组件中使用数据

```astro
<!-- 使用动态数据替换硬编码内容 -->
<p class="font-semibold text-3xl tracking-wider">{phone1}</p>
<p class="font-semibold text-3xl tracking-wider">{phone2}</p>
<p class="font-semibold text-3xl tracking-wider">{email}</p>
```

## 数据传递链

```
Layout.astro (获取数据)
    ↓
Header.astro (接收数据)
    ↓
使用配置数据渲染联系信息

Layout.astro (获取数据)
    ↓
FooterSection.astro (接收数据)
    ↓
使用配置数据渲染页脚信息
```

## 优势

1. **简单直接**：不需要额外的状态管理库
2. **类型安全**：通过 TypeScript 接口定义 props 类型
3. **性能优化**：数据在构建时获取，避免运行时请求
4. **易于维护**：数据流向清晰，便于调试和维护
5. **SEO 友好**：数据在服务端渲染，对搜索引擎友好

## 使用场景

- 网站基本信息（公司名称、联系方式等）
- 多语言配置
- 主题配置
- 社交媒体链接
- 版权信息

## 注意事项

1. **错误处理**：始终提供默认值，避免数据获取失败时页面崩溃
2. **类型定义**：为 siteConfiguration 定义明确的 TypeScript 接口
3. **数据验证**：验证从 API 获取的数据结构
4. **缓存策略**：考虑在开发环境中避免重复请求

## 扩展其他组件

要在其他组件中使用网站配置数据，只需：

1. 在 Layout 中传递数据
2. 在目标组件中定义 Props 接口
3. 接收并使用数据

```astro
<!-- 在 Layout 中 -->
<SomeOtherComponent siteConfiguration={siteConfiguration} />

<!-- 在目标组件中 -->
---
export interface Props {
  siteConfiguration?: any;
}

const { siteConfiguration = {} } = Astro.props;
---
```
