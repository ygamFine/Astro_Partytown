# 字体图标系统使用说明

## 概述

本项目使用统一的字体图标系统，所有图标映射配置都维护在公共区域，供全站复用。

## 文件结构

```
src/
├── config/
│   └── icons.js          # 图标映射配置
├── lib/
│   └── iconUtils.js      # 图标工具函数
├── types/
│   └── icons.d.ts        # TypeScript 类型定义
└── components/
    └── ...               # 各组件使用图标工具
```

## 核心文件说明

### 1. `/src/config/icons.js`
- **`ICON_MAP`**: 图标名称到CSS类名的映射表
- **`ICON_CATEGORIES`**: 图标分类管理
- **`ICON_CONFIG`**: 字体图标基础配置

### 2. `/src/lib/iconUtils.js`
提供全站统一的图标处理方法：
- `getIconClass()`: 获取完整的图标CSS类名
- `hasIcon()`: 检查图标是否存在
- `renderIcon()`: 生成图标HTML字符串
- `createIcon()`: 创建图标DOM元素
- 其他实用工具函数

### 3. `/src/types/icons.d.ts`
TypeScript 类型定义，提供类型安全支持

## 使用方法

### 在 Astro 组件中使用

```astro
---
import { getIconClass } from '../../../lib/iconUtils.js';
---

<!-- 基础用法 -->
<i class={getIconClass('home')}></i>

<!-- 带样式 -->
<i class={`${getIconClass('home')} text-xl text-blue-600`}></i>

<!-- 动态图标 -->
<i class={`${getIconClass(iconName)} text-lg`}></i>
```

### 在 JavaScript 中使用

```javascript
import { 
  getIconClass, 
  hasIcon, 
  renderIcon,
  getIconsByCategory 
} from './lib/iconUtils.js';

// 获取图标类名
const iconClass = getIconClass('home');

// 检查图标是否存在
if (hasIcon('home')) {
  console.log('图标存在');
}

// 渲染图标HTML
const iconHTML = renderIcon('home', {
  size: 'text-xl',
  color: 'text-blue-600',
  className: 'custom-class'
});

// 获取分类图标
const socialIcons = getIconsByCategory('social');
```

### 在客户端脚本中使用

```javascript
import { createIcon } from './lib/iconUtils.js';

// 创建图标元素
const iconElement = createIcon('home', {
  size: 'text-lg',
  color: 'text-gray-600'
});

// 添加到DOM
document.getElementById('container').appendChild(iconElement);
```

## 可用图标分类

### 基础导航 (navigation)
- `home`: 首页
- `search`: 搜索
- `menu`: 菜单
- `grid`: 网格

### 产品相关 (product)
- `package/chanpin/products`: 产品
- `equipment`: 设备

### 新闻资讯 (news)
- `newspaper/news/xinwenshoucang`: 新闻

### 联系交流 (contact)
- `contact/lianxiwomen1`: 联系我们
- `email`: 邮箱
- `phone`: 电话
- `address`: 地址

### 社交媒体 (social)
- `whatsapp`: WhatsApp
- `wechat`: 微信
- `youtube`: YouTube
- `twitter`: Twitter
- `linkedin`: LinkedIn
- `facebook`: Facebook
- 等等...

### 箭头方向 (arrow)
- `arrow-up/down/left/right`: 方向箭头
- `return-top`: 返回顶部

### 功能操作 (action)
- `close`: 关闭
- `check`: 检查
- `download`: 下载
- `play`: 播放

## 添加新图标

### 1. 更新配置文件
在 `/src/config/icons.js` 的 `ICON_MAP` 中添加新的映射：

```javascript
export const ICON_MAP = {
  // 现有图标...
  'new-icon': 'icon-new-icon-class',
  // ...
};
```

### 2. 更新分类（可选）
如果需要，在 `ICON_CATEGORIES` 中添加到相应分类：

```javascript
export const ICON_CATEGORIES = {
  // 现有分类...
  yourCategory: ['new-icon'],
  // ...
};
```

### 3. 使用新图标
```astro
<i class={getIconClass('new-icon')}></i>
```

## 最佳实践

1. **统一管理**: 所有图标映射都在 `icons.js` 中维护，不要在组件中硬编码
2. **语义化命名**: 使用清晰的语义化名称，如 `home`、`contact`、`products`
3. **分类管理**: 合理使用分类功能，便于批量操作和维护
4. **回退机制**: 始终提供合理的默认图标，防止显示异常
5. **类型安全**: 在 TypeScript 项目中使用类型定义

## 示例：MobileBottomMenu 的改造

**改造前（硬编码SVG）**:
```astro
<svg width="24" height="24">...</svg>
```

**改造后（使用统一图标系统）**:
```astro
---
import { getIconClass } from '../../../lib/iconUtils.js';
---
<i class={`${getIconClass(item.icon)} text-xl`}></i>
```

## 性能优势

- ✅ 减少 HTML 体积（字体图标 vs SVG）
- ✅ 统一缓存策略
- ✅ 更好的渲染性能
- ✅ 便于主题切换和样式管理
- ✅ 支持所有现代浏览器

## 兼容性

- 支持所有现代浏览器
- 移动端友好
- 支持 RTL 语言
- 响应式设计友好
