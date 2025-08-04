# ISR (Incremental Static Regeneration) 使用说明

## 概述

本项目使用 Astro 官方的 ISR 功能，通过在每个页面文件中添加 `export const revalidate` 来实现增量静态再生。

## 配置方式

### 1. 环境变量配置

在 `.env` 文件中统一配置重新验证时间：

```bash
# ISR 重新验证时间配置
ISR_REVALIDATE_TIME=3600  # 默认 1 小时
```

### 2. 页面级别配置

在每个页面文件中使用统一的配置管理：

```astro
---
export const prerender = true;
import { getPageRevalidateTime } from '../../lib/isrConfig.js';
export const revalidate = getPageRevalidateTime('home');
---
```

### 3. 重新验证时间设置

- `3600` = 1小时
- `7200` = 2小时  
- `86400` = 24小时
- `604800` = 7天

## 当前配置的页面

所有页面都已配置为统一管理：

- 首页 (`/[lang]/index.astro`) - 1小时
- 产品列表页 (`/[lang]/products/[...page].astro`) - 1小时
- 产品详情页 (`/[lang]/products/[slug].astro`) - 1小时
- 产品页面 (`/[lang]/products.astro`) - 1小时
- 新闻列表页 (`/[lang]/news/[...page].astro`) - 1小时
- 新闻详情页 (`/[lang]/news/[slug].astro`) - 1小时
- 案例列表页 (`/[lang]/case/[...page].astro`) - 1小时
- 案例详情页 (`/[lang]/case/[id].astro`) - 1小时
- 关于页面 (`/[lang]/about.astro`) - 2小时
- 联系页面 (`/[lang]/contact.astro`) - 2小时
- 搜索页面 (`/[lang]/search.astro`) - 1小时

## 工作原理

1. **首次访问**：页面在构建时预渲染
2. **缓存期间**：返回缓存的静态页面
3. **过期后**：下次访问时在后台重新生成页面
4. **新缓存**：使用新生成的内容更新缓存

## 优势

- ✅ 符合 Astro 官方标准
- ✅ 简单易维护
- ✅ 自动处理多语言页面
- ✅ 无需额外的 API 端点
- ✅ 与 Vercel 完美集成

## 注意事项

- 重新验证时间应根据内容更新频率调整
- 较短的重新验证时间会增加服务器负载
- 较长的重新验证时间会影响内容新鲜度 