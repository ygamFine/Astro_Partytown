# 搜索系统迁移说明

## 概述

本项目已从旧的客户端搜索系统完全迁移到 Pagefind 静态搜索系统，以提供更好的搜索体验和性能。旧的搜索代码已被完全删除。

## 迁移内容

### 1. 旧搜索系统（已删除）
- **已删除的文件**：
  - `src/lib/clientSearch.js` - 客户端搜索逻辑
  - `src/lib/searchIndex.js` - 搜索索引生成
  - `src/components/templates/common/GlobalSearch.astro` - 全局搜索组件
  - `src/components/templates/common/SearchBar.astro` - 搜索栏组件
  - `scripts/generate-search-index.js` - 搜索索引生成脚本

- **工作方式**：在构建时生成搜索索引JSON文件，客户端JavaScript加载索引进行搜索

### 2. 新搜索系统（Pagefind）
- **文件位置**：
  - `src/components/templates/common/PagefindSearch.astro` - Pagefind搜索组件
  - `pagefind.config.js` - Pagefind配置
  - `src/pages/[lang]/pagefind-demo.astro` - Pagefind演示页面

- **工作方式**：使用Pagefind库进行静态网站搜索，支持多语言和更好的相关性排序

## 更新内容

### 1. 产品页面更新
- **文件**：`src/pages/[lang]/products/[...page].astro`
- **更改**：添加了Pagefind搜索组件，替换了旧的搜索逻辑

### 2. 搜索页面更新
- **文件**：`src/pages/[lang]/search.astro`
- **更改**：使用Pagefind搜索替代旧的客户端搜索

### 3. PagefindSearch组件增强
- **功能**：
  - 实时搜索结果下拉显示
  - 键盘导航支持（ESC关闭，Enter搜索）
  - 点击外部关闭搜索结果
  - 备用搜索页面跳转
  - 多语言支持

## 构建流程

### 1. 构建脚本更新
在 `package.json` 中，构建流程已更新：

```json
{
  "scripts": {
    "build": "npm run download:strapi-images && npm run optimize:images:node && astro build && npm run generate:pagefind"
  }
}
```

### 2. Pagefind索引生成
构建时会自动运行：
```bash
npm run generate:pagefind
```

这会执行：
```bash
pagefind --source dist
```

## 配置说明

### Pagefind配置 (`pagefind.config.js`)
```javascript
module.exports = {
  source: "dist",
  exclude: [
    "**/404.html",
    "**/robots.txt",
    "**/sitemap.xml",
    "**/_astro/**",
    "**/assets/**"
  ],
  search: {
    languages: ["zh-CN", "en", "ja", "ru", "de", "ar"],
    weights: {
      title: 10,
      excerpt: 5,
      content: 1
    }
  }
};
```

## 使用说明

### 1. 在产品页面使用搜索
产品页面现在包含Pagefind搜索组件，用户可以：
- 在搜索框中输入关键词
- 实时查看搜索结果
- 点击结果跳转到对应页面
- 按Enter键跳转到完整搜索页面

### 2. 搜索功能特性
- **实时搜索**：输入时显示搜索结果下拉框
- **多语言支持**：支持中文、英文、日文、俄文、德文、阿拉伯文
- **相关性排序**：根据标题、摘要、内容权重排序
- **高亮显示**：搜索结果中关键词高亮
- **分类显示**：按产品、新闻、案例分类显示结果

### 3. 备用方案
如果Pagefind加载失败，系统会自动跳转到搜索页面使用备用搜索功能。

## 性能优势

### 1. 更快的搜索速度
- Pagefind使用优化的索引结构
- 客户端搜索，无需网络请求
- 毫秒级响应时间

### 2. 更好的相关性
- 支持标题、摘要、内容的权重配置
- 智能的相关性排序算法
- 支持模糊匹配和部分匹配

### 3. 更小的包体积
- 搜索索引在构建时生成
- 按需加载Pagefind脚本
- 减少客户端JavaScript代码

## 维护说明

### 1. 添加新页面到搜索
新页面会自动被Pagefind索引，无需额外配置。

### 2. 自定义搜索字段
可以在HTML中添加data属性来自定义搜索字段：
```html
<div data-pagefind-title="自定义标题" data-pagefind-excerpt="自定义摘要">
  页面内容
</div>
```

### 3. 排除页面
在 `pagefind.config.js` 的 `exclude` 数组中添加要排除的文件模式。

## 故障排除

### 1. Pagefind未加载
- 检查构建是否成功生成了Pagefind索引
- 确认 `/_pagefind/` 目录存在
- 检查网络连接

### 2. 搜索结果为空
- 确认页面内容包含搜索关键词
- 检查Pagefind索引是否正确生成
- 查看浏览器控制台是否有错误

### 3. 搜索性能问题
- 检查索引文件大小
- 确认Pagefind脚本正确加载
- 优化搜索权重配置

## 总结

通过完全迁移到Pagefind搜索系统，我们获得了：
- 更好的搜索性能和用户体验
- 更智能的相关性排序
- 更小的包体积和更快的加载速度
- 更好的多语言支持
- 更简单的维护和配置
- 更清洁的代码库（删除了旧的搜索代码）

现在项目只使用Pagefind搜索系统，代码更加简洁和高效。
