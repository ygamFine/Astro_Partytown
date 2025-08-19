# 🎯 动态脚本加载器 - Astro SSG 优化版

这是一个专为 Astro 框架设计的动态脚本加载器，支持 **SSG（静态站点生成）** 方式，在构建时从 Strapi API 获取脚本并直接插入到 HTML 中，无需客户端加载。

## ✨ 主要特性

- 🔄 **SSG 构建时加载**: 在构建时从 Strapi API 获取脚本，直接插入到生成的 HTML 中
- 🚀 **智能脚本处理**: 自动检测并处理脚本内容
- 🎯 **按需加载支持**: 支持根据页面类型、路由或条件动态加载不同的脚本
- 🎨 **样式支持**: 支持动态 CSS 样式插入
- 📊 **性能优化**: 生产环境使用缓存，开发环境实时获取
- 🔧 **直接插入**: 直接使用 API 返回的原始脚本内容，无需额外处理
- 🎯 **单一组件**: 一个组件通过传参控制不同位置的脚本插入，避免重复API请求

## 📦 使用方法

### 1. 基础使用（在布局文件中）

```astro
---
import DynamicScriptLoader from "../components/common/analytics/DynamicScriptLoader.astro";
---

<html>
<head>
  <!-- Header 位置动态脚本加载器 -->
  <DynamicScriptLoader position="header" />
</head>
<body>
  <!-- Body Top 位置动态脚本加载器 -->
  <DynamicScriptLoader position="body-top" />
  
  <!-- 页面内容 -->
  
  <!-- Body Bottom 位置动态脚本加载器 -->
  <DynamicScriptLoader position="body-bottom" />
</body>
</html>
```

### 2. 按需加载使用

```astro
---
import DynamicScriptLoader from "../components/common/analytics/DynamicScriptLoader.astro";

// 根据页面类型决定是否加载脚本
const shouldLoadAnalytics = pageType === 'product' || pageType === 'case';
---

{shouldLoadAnalytics && (
  <>
    <!-- Header 位置脚本 -->
    <DynamicScriptLoader 
      position="header"
      pageType={pageType}
      route={route}
      loadCondition={shouldLoadAnalytics}
    />
    
    <!-- Body Bottom 位置脚本 -->
    <DynamicScriptLoader 
      position="body-bottom"
      pageType={pageType}
      route={route}
      loadCondition={shouldLoadAnalytics}
    />
  </>
)}
```

### 3. 条件加载

```astro
---
// 根据条件决定是否加载脚本
const shouldLoadScripts = pageType !== 'none' && route !== 'excluded';
---

{shouldLoadScripts && (
  <DynamicScriptLoader 
    position="header"
    pageType={pageType}
    route={route}
    loadCondition={shouldLoadScripts}
  />
)}
```

## 🔧 API 数据格式

动态脚本加载器期望从 Strapi API 获取以下格式的数据：

```json
{
  "data": {
    "id": 2,
    "documentId": "ucqdri3tcmh61ovyna6mhp08",
    "header_label_meta": null,
    "header_label_css": null,
    "header_label_scripts": "\\u003Cscript\\u003E\\n  console.log('HELLO WORLD LABEL')\\n\\u003C/script\\u003E",
    "body_label_top_css": null,
    "body_label_top_css_scripts": "\\u003Cscript\\u003E\\n  console.log('HELLO WORLD BODY TOP')\\n\\u003C/script\\u003E",
    "body_label_bottom_css": null,
    "body_label_bottom_scripts": "\\u003Cscript\\u003E\\n  console.log('HELLO WORLD BODY BOTTOM')\\n\\u003C/script\\u003E",
    "createdAt": "2025-08-19T03:09:58.525Z",
    "updatedAt": "2025-08-19T03:09:58.525Z",
    "publishedAt": "2025-08-19T03:09:58.619Z",
    "title": "测试专用"
  },
  "meta": {}
}
```

### 字段说明

- `header_label_meta`: 插入到 `<head>` 标签内的 meta 标签
- `header_label_css`: 插入到 `<head>` 标签内的 CSS 样式
- `header_label_scripts`: 插入到 `<head>` 标签内的 JavaScript 脚本
- `body_label_top_css`: 插入到 `<body>` 标签开始处的 CSS 样式
- `body_label_top_css_scripts`: 插入到 `<body>` 标签开始处的 JavaScript 脚本
- `body_label_bottom_css`: 插入到 `<body>` 标签结束前的 CSS 样式
- `body_label_bottom_scripts`: 插入到 `<body>` 标签结束前的 JavaScript 脚本

## 🚀 工作原理

### SSG 构建时处理

1. **构建时 API 请求**: 在 Astro 构建过程中从 Strapi API 获取脚本数据
2. **直接内容插入**: 直接使用 API 返回的原始脚本内容，无需额外处理
3. **HTML 生成**: 使用 `set:html` 将脚本内容直接插入到生成的 HTML 中

### 按需加载机制

1. **条件检查**: 根据 `pageType`、`route`、`loadCondition` 等参数决定是否加载
2. **位置过滤**: 通过 `position` 参数指定要插入的脚本位置
3. **智能过滤**: 只加载指定位置的脚本，减少不必要的代码

## ⚙️ 配置选项

### 环境变量

```javascript
// 生产环境使用缓存
cache: isProd ? 'force-cache' : 'no-store'
```

### 组件参数

```typescript
interface Props {
  position: 'header' | 'body-top' | 'body-bottom';  // 脚本插入位置
  pageType?: string;        // 页面类型
  route?: string;           // 路由路径
  loadCondition?: boolean;  // 加载条件
}
```

### 位置选项

- `'header'`: 头部脚本（插入到 `<head>` 标签内）
- `'body-top'`: 页面顶部脚本（插入到 `<body>` 标签开始处）
- `'body-bottom'`: 页面底部脚本（插入到 `<body>` 标签结束前）

## 📊 性能优化

### SSG 优势

- **零客户端加载**: 脚本在构建时直接插入 HTML，无需客户端请求
- **缓存友好**: 生产环境使用 `force-cache` 减少 API 请求
- **SEO 友好**: 脚本直接存在于 HTML 中，搜索引擎可以正常抓取

### 按需加载优势

- **减少代码体积**: 只加载需要的脚本位置
- **提高加载速度**: 减少不必要的脚本执行
- **灵活控制**: 根据页面需求动态决定加载内容

### 单一组件优势

- **避免重复API请求**: 一个组件处理所有位置，避免多次请求
- **代码复用**: 减少重复代码，提高维护性
- **统一管理**: 所有脚本逻辑集中在一个组件中

## 🛠️ 错误处理

### 常见错误及解决方案

1. **API 请求失败**
   ```
   错误: API 请求失败: 404
   解决: 检查 Strapi API 地址是否正确
   ```

2. **脚本格式错误**
   ```
   错误: 脚本格式不正确
   解决: 检查 API 返回的脚本内容格式
   ```

3. **脚本格式错误**
   ```
   问题: 脚本内容格式不正确
   解决: 检查 API 返回的脚本内容格式
   ```

## 📝 使用示例

### 完整示例 - 产品页面

```astro
---
import Layout from '../layouts/Layout.astro';
import DynamicScriptLoader from '../components/common/analytics/DynamicScriptLoader.astro';

const pageType = 'product';
const productId = Astro.params.id;
---

<Layout title="产品详情" description="产品详细信息">
  <!-- Header 位置脚本 -->
  <DynamicScriptLoader 
    position="header"
    pageType={pageType}
    route={`/products/${productId}`}
  />
  
  <main>
    <h1>产品详情</h1>
    <!-- 产品内容 -->
  </main>
  
  <!-- Body Bottom 位置脚本 -->
  <DynamicScriptLoader 
    position="body-bottom"
    pageType={pageType}
    route={`/products/${productId}`}
  />
</Layout>
```

### 条件加载示例

```astro
---
// 根据用户权限决定是否加载分析脚本
const userRole = Astro.locals.user?.role;
const shouldLoadAnalytics = userRole === 'admin' || userRole === 'analyst';
---

{shouldLoadAnalytics && (
  <>
    <DynamicScriptLoader 
      position="header"
      pageType="admin"
      loadCondition={shouldLoadAnalytics}
    />
    <DynamicScriptLoader 
      position="body-bottom"
      pageType="admin"
      loadCondition={shouldLoadAnalytics}
    />
  </>
)}
```

## 🔄 更新日志

### v3.0.0 - 单一组件优化版
- ✅ **单一组件设计**: 一个组件通过传参控制不同位置的脚本插入
- ✅ **避免重复API请求**: 减少多次API调用，提高性能
- ✅ **代码复用**: 减少重复代码，提高维护性
- ✅ **统一管理**: 所有脚本逻辑集中在一个组件中

### v2.0.0 - SSG 优化版
- ✅ **SSG 构建时加载**: 在构建时获取脚本并插入 HTML
- ✅ **智能脚本处理**: 自动检测并处理脚本内容
- ✅ **直接内容插入**: 直接使用 API 返回的原始脚本内容
- ✅ **按需加载支持**: 支持条件加载和类型过滤
- ✅ **性能优化**: 零客户端加载，提高页面性能

### v1.0.0 - 基础版
- ✅ 基础动态脚本加载功能
- ✅ Strapi API 集成
- ✅ 自动脚本执行
- ✅ 多位置支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

🎯 **提示**: 
1. 确保你的 Strapi API 正常运行，并且返回正确的数据格式
2. 脚本会在构建时直接插入到 HTML 中，无需客户端处理
3. 使用按需加载可以显著提高页面性能和加载速度
4. 开发环境下会显示详细的调试信息，帮助排查问题
5. 单一组件设计避免了重复API请求，提高了性能
