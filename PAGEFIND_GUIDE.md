# Pagefind 搜索系统使用指南

## 概述

本项目已完全集成 Pagefind 静态搜索系统，提供快速、智能的全站搜索功能。Pagefind 是一个专为静态网站设计的搜索解决方案，具有以下优势：

- ⚡ **快速搜索**：毫秒级响应，实时搜索结果
- 🧠 **智能排序**：基于相关性的智能排序算法
- 🌍 **多语言支持**：支持 20+ 种语言
- 🔒 **隐私保护**：客户端搜索，无需服务器
- 📱 **离线可用**：搜索索引在构建时生成
- 🎯 **易于集成**：简单的配置和集成

## 功能特性

### 1. 实时搜索
- 输入时实时显示搜索结果
- 支持键盘导航（ESC 关闭，Enter 搜索）
- 点击外部区域关闭搜索结果

### 2. 智能排序
- 标题匹配权重最高
- 摘要和内容按相关性排序
- 支持模糊匹配和部分匹配

### 3. 多语言支持
- 支持中文、英文、日文、俄文、德文、阿拉伯文等 20+ 种语言
- 自动检测页面语言
- 多语言搜索结果分类显示

### 4. 高级搜索
- 支持引号精确匹配
- 支持减号排除关键词
- 支持布尔搜索操作

## 文件结构

```
src/
├── components/templates/common/
│   └── PagefindSearch.astro          # Pagefind 搜索组件
├── pages/[lang]/
│   ├── search.astro                  # 搜索页面
│   └── pagefind-demo.astro           # Pagefind 演示页面
├── types/
│   └── pagefind.d.ts                 # Pagefind 类型声明
└── layouts/
    └── Layout.astro                  # 布局组件（包含 Pagefind 初始化）

pagefind.config.js                    # Pagefind 配置文件
```

## 配置说明

### Pagefind 配置文件 (`pagefind.config.js`)

```javascript
module.exports = {
  // 指定要索引的目录
  source: "dist",
  
  // 排除不需要搜索的文件
  exclude: [
    "**/404.html",
    "**/robots.txt",
    "**/sitemap.xml",
    "**/_astro/**",
    "**/assets/**",
    "**/*.js",
    "**/*.css",
    "**/*.map",
    "**/pagefind/**"
  ],
  
  // 搜索配置
  search: {
    // 支持的语言
    languages: ["zh-CN", "en", "ja", "ru", "de", "ar", "fr", "es", "it", "pt-pt", "nl", "pl", "th", "id", "vi", "ms", "ml", "my", "hi", "ko", "tr"],
    
    // 搜索权重配置
    weights: {
      title: 10,        // 标题权重最高
      excerpt: 5,       // 摘要权重中等
      content: 1,       // 内容权重最低
      category: 3,      // 分类权重
      tags: 2           // 标签权重
    }
  },
  
  // 索引配置
  index: {
    // 索引文件类型
    extensions: [".html"],
    
    // 自定义索引字段
    fields: [
      {
        name: "title",
        selector: "h1, h2, h3, .title, [data-pagefind-title]"
      },
      {
        name: "excerpt", 
        selector: ".excerpt, .description, [data-pagefind-excerpt], meta[name='description']"
      },
      {
        name: "content",
        selector: "main, article, .content, [data-pagefind-content], .prose"
      },
      {
        name: "category",
        selector: "[data-pagefind-category]"
      },
      {
        name: "date",
        selector: "[data-pagefind-date], time[datetime]"
      },
      {
        name: "tags",
        selector: "[data-pagefind-tags], .tags, .tag"
      },
      {
        name: "lang",
        selector: "html[lang]"
      }
    ]
  }
};
```

## 使用方法

### 1. 在页面中使用搜索组件

```astro
---
import PagefindSearch from '../../components/templates/common/PagefindSearch.astro';
---

<!-- 基本搜索组件 -->
<PagefindSearch lang={lang} />

<!-- 自定义配置 -->
<PagefindSearch 
  lang={lang}
  placeholder="搜索产品..."
  showInfo={false}
  showResults={true}
/>
```

### 2. 搜索页面集成

```astro
---
import PagefindSearch from '../../components/templates/common/PagefindSearch.astro';
---

<Layout title="搜索" lang={lang}>
  <div class="search-page">
    <!-- 搜索框 -->
    <PagefindSearch lang={lang} showInfo={false} />
    
    <!-- 搜索结果区域 -->
    <div id="pagefind-search-results"></div>
  </div>
</Layout>

<script>
  // 初始化 Pagefind 搜索
  document.addEventListener('DOMContentLoaded', async function() {
    const { PagefindUI } = await import('@pagefind/default-ui');
    
    const pagefind = new PagefindUI({
      element: document.getElementById('pagefind-search-results'),
      showImages: true,
      translations: {
        placeholder: "搜索产品、新闻、案例...",
        clear_search: "清除搜索",
        no_results: "没有找到结果"
      }
    });
  });
</script>
```

### 3. 自定义搜索字段

在 HTML 中添加 `data-pagefind-*` 属性来自定义搜索字段：

```html
<article>
  <h1 data-pagefind-title="产品标题">产品标题</h1>
  <p data-pagefind-excerpt="产品简介">产品简介内容</p>
  <div data-pagefind-content>
    <!-- 搜索内容 -->
  </div>
  <span data-pagefind-category="product">产品</span>
  <time data-pagefind-date="2024-01-01">2024年1月1日</time>
  <div data-pagefind-tags="工程机械,装载机">工程机械,装载机</div>
</article>
```

## 构建流程

### 1. 开发环境

```bash
# 启动开发服务器
npm run dev
```

### 2. 生产构建

```bash
# 构建项目并生成 Pagefind 索引
npm run build
```

构建流程包括：
1. 下载 Strapi 图片
2. 优化图片
3. 构建 Astro 项目
4. 生成 Pagefind 搜索索引

### 3. 预览构建结果

```bash
npm run preview
```

## 搜索功能

### 1. 基本搜索

- 输入关键词进行搜索
- 支持中文、英文等多种语言
- 实时显示搜索结果

### 2. 高级搜索

- **精确匹配**：使用引号包围关键词
  ```
  "工程机械"
  ```

- **排除关键词**：使用减号排除
  ```
  装载机 -小型
  ```

- **布尔搜索**：支持 AND、OR 操作
  ```
  装载机 AND 工程机械
  ```

### 3. 搜索结果

搜索结果按以下方式显示：

1. **标题匹配**：权重最高，优先显示
2. **摘要匹配**：权重中等
3. **内容匹配**：权重最低
4. **分类标签**：按产品、新闻、案例分类
5. **日期排序**：最新内容优先

## 样式定制

### 1. Pagefind UI 变量

```css
:global(.pagefind-ui) {
  --pagefind-ui-primary: #dc2626;        /* 主色调 */
  --pagefind-ui-text: #374151;           /* 文本颜色 */
  --pagefind-ui-background: #ffffff;     /* 背景颜色 */
  --pagefind-ui-border: #e5e7eb;         /* 边框颜色 */
  --pagefind-ui-tag: #f3f4f6;            /* 标签背景 */
  --pagefind-ui-border-width: 1px;       /* 边框宽度 */
  --pagefind-ui-border-radius: 8px;      /* 圆角 */
  --pagefind-ui-font: system-ui, -apple-system, sans-serif; /* 字体 */
  --pagefind-ui-font-size: 14px;         /* 字体大小 */
  --pagefind-ui-line-height: 1.4;        /* 行高 */
}
```

### 2. 自定义样式

```css
/* 搜索结果样式 */
:global(.pagefind-ui__result) {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: white;
  transition: all 0.2s ease;
}

:global(.pagefind-ui__result:hover) {
  border-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);
}

/* 搜索链接样式 */
:global(.pagefind-ui__result-link) {
  color: #1f2937;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
}

:global(.pagefind-ui__result-link:hover) {
  color: #dc2626;
}
```

## 故障排除

### 1. Pagefind 未加载

**问题**：搜索功能无法使用，控制台显示错误

**解决方案**：
1. 检查构建是否成功生成了 Pagefind 索引
2. 确认 `dist/_pagefind/` 目录存在
3. 检查网络连接
4. 查看浏览器控制台错误信息

### 2. 搜索结果为空

**问题**：搜索时没有显示任何结果

**解决方案**：
1. 确认页面内容包含搜索关键词
2. 检查 Pagefind 索引是否正确生成
3. 查看页面是否有正确的 HTML 结构
4. 检查 `pagefind.config.js` 配置

### 3. 搜索性能问题

**问题**：搜索响应缓慢

**解决方案**：
1. 检查索引文件大小
2. 确认 Pagefind 脚本正确加载
3. 优化搜索权重配置
4. 减少索引文件数量

### 4. 多语言搜索问题

**问题**：多语言搜索不准确

**解决方案**：
1. 确认页面 `lang` 属性正确设置
2. 检查 `pagefind.config.js` 中的语言配置
3. 验证多语言内容是否正确索引

## 最佳实践

### 1. 内容优化

- 使用语义化的 HTML 标签
- 添加适当的 `data-pagefind-*` 属性
- 确保页面有清晰的标题和描述

### 2. 性能优化

- 合理配置搜索权重
- 排除不必要的文件
- 优化索引文件大小

### 3. 用户体验

- 提供清晰的搜索提示
- 实现键盘导航支持
- 添加加载状态指示

### 4. 维护建议

- 定期更新 Pagefind 版本
- 监控搜索性能
- 收集用户反馈

## 更新日志

### v1.0.0 (2024-01-01)
- 初始集成 Pagefind 搜索系统
- 支持多语言搜索
- 实现实时搜索功能
- 添加搜索页面和演示页面

## 技术支持

如果遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查 Pagefind 官方文档
3. 查看项目 GitHub Issues
4. 联系开发团队

## 相关链接

- [Pagefind 官方文档](https://pagefind.app/)
- [Pagefind GitHub](https://github.com/cloudcannon/pagefind)
- [Astro 官方文档](https://docs.astro.build/)
