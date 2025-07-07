# 通用二三级页面模板系统

这是一个专为 Astro + Partytown 项目设计的通用二三级页面模板系统，完全支持 SSG (静态站点生成) 和全文检索功能。

## 📁 组件结构

```
src/components/templates/
├── SecondaryPageLayout.astro  # 主模板布局
├── Breadcrumb.astro          # 面包屑导航
├── Sidebar.astro             # 左侧栏目列表
├── SearchBar.astro           # 搜索栏 (支持全文检索)
├── GridList.astro            # 图片式网格列表
├── NewsList.astro            # 新闻式左图右文字列表
├── Pagination.astro          # 分页组件
└── README.md                 # 使用文档
```

## 🚀 快速开始

### 1. 基本用法

```astro
---
import SecondaryPageLayout from '../components/templates/SecondaryPageLayout.astro';
import GridList from '../components/templates/GridList.astro';
import Pagination from '../components/templates/Pagination.astro';

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Products' }
];

const items = [
  {
    id: 1,
    title: 'Product Name',
    image: '/product.jpg',
    excerpt: 'Product description...',
    price: '$1,000',
    category: 'Category',
    href: '/products/product-slug'
  }
];
---

<SecondaryPageLayout 
  title="Products"
  description="Page description"
  breadcrumbs={breadcrumbs}
  currentSection="products"
  contentType="grid"
  searchable={true}
>
  <GridList items={items} itemsPerRow={3} maxRows={4} />
  <Pagination currentPage={1} totalPages={5} baseUrl="/products" />
</SecondaryPageLayout>
```

### 2. SSG 分页实现

```astro
---
export const prerender = true;

export function getStaticPaths() {
  const itemsPerPage = 12;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paths = [];
  
  // 第一页
  paths.push({
    params: { page: undefined },
    props: { 
      currentPage: 1,
      totalPages,
      items: data.slice(0, itemsPerPage)
    }
  });
  
  // 其他页面
  for (let i = 2; i <= totalPages; i++) {
    paths.push({
      params: { page: i.toString() },
      props: {
        currentPage: i,
        totalPages,
        items: data.slice((i - 1) * itemsPerPage, i * itemsPerPage)
      }
    });
  }
  
  return paths;
}
---
```

## 📝 组件详解

### SecondaryPageLayout

主模板布局组件，提供统一的页面结构。

**Props:**
- `title: string` - 页面标题
- `description?: string` - 页面描述
- `breadcrumbs: Array<{label: string, href?: string}>` - 面包屑数据
- `currentSection: 'products' | 'news' | 'cases'` - 当前页面类型
- `contentType?: 'grid' | 'list'` - 内容显示类型
- `searchable?: boolean` - 是否显示搜索栏

### GridList

图片式网格列表组件，适用于产品展示。

**Props:**
- `items: Array<GridItem>` - 列表项数据
- `itemsPerRow?: number` - 每行显示数量 (默认: 3)
- `maxRows?: number` - 最大行数 (默认: 4)

**GridItem 接口:**
```typescript
{
  id: string | number;
  title: string;
  image: string;
  excerpt?: string;
  price?: string;
  category?: string;
  href: string;
}
```

### NewsList

新闻式左图右文字列表组件。

**Props:**
- `items: Array<NewsItem>` - 新闻项数据
- `maxItems?: number` - 最大显示数量 (默认: 10)

**NewsItem 接口:**
```typescript
{
  id: string | number;
  title: string;
  image: string;
  excerpt: string;
  date?: string;
  category?: string;
  href: string;
  author?: string;
  readTime?: string;
}
```

### Pagination

分页组件，完全支持SSG。

**Props:**
- `currentPage: number` - 当前页码
- `totalPages: number` - 总页数
- `baseUrl: string` - 基础URL
- `maxVisiblePages?: number` - 最大显示页码数 (默认: 5)

### SearchBar

全文检索搜索栏组件。

**特性:**
- 实时搜索建议
- 结果高亮显示
- 按内容类型分类搜索
- 完全客户端运行，支持SSG

### Sidebar

左侧栏目列表组件。

**Props:**
- `currentSection: 'products' | 'news' | 'cases'` - 当前页面类型

## 🎯 使用示例

### 产品列表页面

```astro
---
export const prerender = true;
import SecondaryPageLayout from '../components/templates/SecondaryPageLayout.astro';
import GridList from '../components/templates/GridList.astro';
import { products } from '../data/products.js';

const gridItems = products.map(product => ({
  id: product.id,
  title: product.name,
  image: product.image,
  excerpt: product.excerpt,
  price: product.price,
  category: product.category,
  href: `/products/${product.slug}`
}));

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Products' }
];
---

<SecondaryPageLayout 
  title="Products"
  breadcrumbs={breadcrumbs}
  currentSection="products"
  contentType="grid"
  searchable={true}
>
  <GridList items={gridItems} itemsPerRow={3} maxRows={4} />
</SecondaryPageLayout>
```

### 新闻列表页面

```astro
---
export const prerender = true;
import SecondaryPageLayout from '../components/templates/SecondaryPageLayout.astro';
import NewsList from '../components/templates/NewsList.astro';
import { allNews } from '../data/news.js';

const newsItems = allNews.map(news => ({
  id: news.id,
  title: news.title,
  image: news.image,
  excerpt: news.excerpt,
  date: news.date,
  category: news.category,
  href: `/news/${news.slug}`,
  readTime: '5 min read'
}));

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News' }
];
---

<SecondaryPageLayout 
  title="News Center"
  breadcrumbs={breadcrumbs}
  currentSection="news"
  contentType="list"
  searchable={true}
>
  <NewsList items={newsItems} />
</SecondaryPageLayout>
```

## 🔍 全文检索功能

搜索系统特性：
- **静态数据搜索**: 基于现有数据文件生成搜索索引
- **实时搜索**: 输入时即时显示结果
- **结果高亮**: 搜索关键词高亮显示
- **分类筛选**: 按产品、新闻、案例分类搜索
- **SSG 兼容**: 完全客户端运行，无需服务器

## 📱 响应式设计

所有组件都针对移动设备进行了优化：
- **桌面端**: 完整功能展示
- **平板端**: 适配布局调整
- **移动端**: 优化的触摸交互

## 🎨 样式定制

组件使用 Tailwind CSS 构建，可以通过以下方式定制：

1. **修改组件样式**: 直接编辑组件内的 `<style>` 标签
2. **覆盖 CSS 类**: 在全局样式中添加自定义样式
3. **配置 Tailwind**: 修改 `tailwind.config.js`

## ✅ SSG 检查清单

- [x] 所有页面使用 `export const prerender = true`
- [x] 动态路由实现 `getStaticPaths()`
- [x] 静态数据源，无运行时API调用
- [x] 完整的面包屑导航
- [x] 适配移动端的响应式设计
- [x] 搜索功能完全客户端运行
- [x] 图片使用 WebP 格式和懒加载

## 🚀 性能优化

- **图片优化**: WebP 格式 + 懒加载
- **CSS 优化**: Tailwind CSS 的 JIT 编译
- **JavaScript 最小化**: 仅必要的客户端代码
- **SEO 友好**: 完整的 HTML 预渲染

## 📦 部署

模板系统完全支持静态部署到：
- Vercel
- Netlify  
- GitHub Pages
- AWS S3
- 任何 CDN 服务

## 🔧 故障排除

### 常见问题

1. **搜索不工作**: 检查数据文件路径和格式
2. **分页链接错误**: 确认 `baseUrl` 设置正确
3. **图片不显示**: 验证图片路径和 WebP 格式支持
4. **移动端布局问题**: 检查 Tailwind 响应式类名

### 调试提示

- 使用浏览器开发者工具检查控制台错误
- 验证生成的静态文件结构
- 确认所有组件导入路径正确 