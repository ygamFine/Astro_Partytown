# 面包屑组件使用指南

## 概述

本项目实现了一个统一的面包屑导航系统，支持多语言国际化，可以在全站范围内使用。

## 文件结构

```
src/
├── components/templates/
│   └── Breadcrumb.astro          # 面包屑组件
├── lib/
│   └── breadcrumbUtils.ts        # 面包屑工具函数
├── types/
│   └── breadcrumb.ts             # 类型定义
└── locales/
    ├── en/breadcrumb.json        # 英文面包屑翻译
    ├── zh-hans/breadcrumb.json   # 简体中文面包屑翻译
    └── ...                       # 其他语言
```

## 快速开始

### 1. 基本使用

```astro
---
import Breadcrumb from '../components/templates/Breadcrumb.astro';

const breadcrumbs = [
  { label: 'home', href: '/en' },
  { label: 'products', href: '/en/products' },
  { label: 'Product Name' }
];
---

<Breadcrumb breadcrumbs={breadcrumbs} lang="en" />
```

### 2. 使用工具函数

```astro
---
import Breadcrumb from '../components/templates/Breadcrumb.astro';
import { generateProductBreadcrumbs } from '../lib/breadcrumbUtils.js';

const breadcrumbs = generateProductBreadcrumbs('en', 'Product Name', 'Category');
---

<Breadcrumb breadcrumbs={breadcrumbs} lang="en" />
```

## 工具函数

### 产品相关

```typescript
// 产品详情页面
generateProductBreadcrumbs(lang: string, productName: string, category?: string)

// 产品列表页面
generateProductListBreadcrumbs(lang: string, category?: string)
```

### 新闻相关

```typescript
// 新闻列表页面
generateNewsBreadcrumbs(lang: string, page?: number)

// 新闻详情页面
generateNewsDetailBreadcrumbs(lang: string, newsTitle: string)
```

### 案例相关

```typescript
// 案例列表页面
generateCaseBreadcrumbs(lang: string, page?: number)

// 案例详情页面
generateCaseDetailBreadcrumbs(lang: string, caseTitle: string)
```

### 其他页面

```typescript
// 关于页面
generateAboutBreadcrumbs(lang: string)

// 联系页面
generateContactBreadcrumbs(lang: string)

// 搜索页面
generateSearchBreadcrumbs(lang: string, searchTerm: string)

// 自定义面包屑
generateCustomBreadcrumbs(lang: string, items: Array<{label: string, href?: string}>)
```

## 翻译文件

每个语言都需要有对应的 `breadcrumb.json` 文件，包含以下键值：

```json
{
  "home": "Home",
  "about": "About",
  "products": "Products",
  "productDetail": "Product Detail",
  "case": "Cases",
  "news": "News",
  "contact": "Contact",
  "search": "Search Results",
  "category": "Category",
  "all": "All"
}
```

## 组件特性

### 1. 自动国际化
- 根据传入的 `lang` 参数自动加载对应语言的翻译
- 如果指定语言加载失败，自动回退到英文
- 如果英文也加载失败，使用 label 作为显示文本

### 2. 错误处理
- 翻译文件加载失败时不会报错
- 缺失的翻译键会使用 fallback 值
- 控制台会输出警告信息便于调试

### 3. 无障碍支持
- 自动生成合适的 `aria-label`
- 支持键盘导航
- 语义化的 HTML 结构

### 4. 样式定制
- 使用 Tailwind CSS 类名
- 支持 hover 效果
- 响应式设计

## 实际使用示例

### 产品详情页面

```astro
---
import Breadcrumb from '../../../components/templates/Breadcrumb.astro';
import { generateProductBreadcrumbs } from '../../../lib/breadcrumbUtils.js';

const { product, lang } = Astro.props;
const breadcrumbs = generateProductBreadcrumbs(lang, product.name, product.category);
---

<Layout title={`${product.name} - 产品详情`}>
  <div class="bg-white border-b">
    <div class="container mx-auto px-4 py-4">
      <Breadcrumb breadcrumbs={breadcrumbs} lang={lang} />
    </div>
  </div>
  <!-- 页面内容 -->
</Layout>
```

### 新闻列表页面

```astro
---
import Breadcrumb from '../../components/templates/Breadcrumb.astro';
import { generateNewsBreadcrumbs } from '../../lib/breadcrumbUtils.js';

const { lang, page } = Astro.props;
const breadcrumbs = generateNewsBreadcrumbs(lang, page);
---

<Layout title="新闻中心">
  <div class="bg-white border-b">
    <div class="container mx-auto px-4 py-4">
      <Breadcrumb breadcrumbs={breadcrumbs} lang={lang} />
    </div>
  </div>
  <!-- 页面内容 -->
</Layout>
```

## 迁移指南

### 从旧版本迁移

1. **替换手动定义的面包屑数组**：
   ```astro
   // 旧方式
   const breadcrumbs = [
     { label: t.breadcrumb.home, href: `/${lang}` },
     { label: t.breadcrumb.products, href: `/${lang}/products` }
   ];
   
   // 新方式
   const breadcrumbs = generateProductBreadcrumbs(lang, productName, category);
   ```

2. **更新组件调用**：
   ```astro
   // 旧方式
   <Breadcrumb breadcrumbs={breadcrumbs} />
   
   // 新方式
   <Breadcrumb breadcrumbs={breadcrumbs} lang={lang} />
   ```

3. **确保翻译文件存在**：
   - 检查所有语言的 `breadcrumb.json` 文件
   - 确保包含所有必要的翻译键

## 故障排除

### 常见问题

1. **"Cannot read properties of undefined (reading 'home')"**
   - 检查翻译文件是否存在
   - 确认翻译键是否正确
   - 验证语言参数是否正确传递

2. **面包屑不显示**
   - 检查 breadcrumbs 数组是否为空
   - 确认组件是否正确导入
   - 验证样式是否正确加载

3. **翻译不生效**
   - 检查 `breadcrumb.json` 文件格式
   - 确认语言代码是否正确
   - 验证文件路径是否正确

### 调试技巧

1. **启用调试模式**：
   ```astro
   <Breadcrumb breadcrumbs={breadcrumbs} lang={lang} debug={true} />
   ```

2. **检查翻译加载**：
   ```astro
   console.log('Breadcrumb translations:', t);
   ```

3. **验证面包屑数据**：
   ```astro
   console.log('Breadcrumbs:', breadcrumbs);
   ```

## 最佳实践

1. **始终使用工具函数**：避免手动定义面包屑数组
2. **传递语言参数**：确保组件能正确加载翻译
3. **使用语义化的 label**：使用翻译键而不是硬编码文本
4. **测试多语言**：确保所有语言都能正常工作
5. **保持一致性**：全站使用相同的面包屑结构

## 扩展

### 添加新的面包屑类型

1. 在 `breadcrumbUtils.ts` 中添加新的生成函数
2. 在 `breadcrumb.json` 中添加对应的翻译键
3. 更新类型定义（如需要）
4. 添加使用示例

### 自定义样式

可以通过修改 `Breadcrumb.astro` 组件的样式部分来自定义外观：

```astro
<style>
  .breadcrumb {
    @apply flex items-center text-gray-600;
  }
  
  .breadcrumb a {
    @apply hover:underline hover:text-red-600;
  }
</style>
``` 