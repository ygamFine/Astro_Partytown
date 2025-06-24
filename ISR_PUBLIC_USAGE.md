# 公共ISR缓存管理器使用指南

## 概述

公共ISR缓存管理器是一个统一的缓存解决方案，让所有接口都能享受30秒自动更新功能，类似Next.js的ISR功能。

## 核心特性

### 🚀 智能缓存策略
- **菜单**: 30秒缓存
- **新闻**: 1分钟缓存  
- **产品**: 5分钟缓存
- **公司信息**: 1小时缓存

### ⚡ 自动更新机制
- 30秒检查一次更新
- 数据变化时自动刷新
- 无刷新页面更新
- 实时更新通知

### 🛡️ 容错机制
- 3次重试机制
- 递增延迟重试
- 过期缓存降级
- 离线支持

## 基本使用

### 1. 导入缓存管理器

```javascript
import { isrCache } from '../lib/isr-cache.js';
```

### 2. 获取数据

```javascript
// 获取菜单数据 (30秒缓存)
const menus = await isrCache.getData('menus');

// 获取新闻数据 (1分钟缓存)
const news = await isrCache.getData('news');

// 获取产品数据 (5分钟缓存)
const products = await isrCache.getData('products');

// 获取公司信息 (1小时缓存)
const company = await isrCache.getData('company');
```

### 3. 带参数请求

```javascript
// 获取分页新闻
const news = await isrCache.getData('news', {
  params: { page: 1, limit: 10 }
});

// 获取特定分类产品
const products = await isrCache.getData('products', {
  params: { category: 'machinery' }
});
```

## 高级配置

### 自定义缓存时间

```javascript
// 设置产品缓存为10分钟
isrCache.setCacheStrategy('products', 600000);

// 设置新闻缓存为30秒
isrCache.setCacheStrategy('news', 30000);
```

### 自定义数据转换

```javascript
const customNews = await isrCache.getData('news', {
  transform: (data) => {
    return data.data?.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.excerpt?.substring(0, 100),
      date: new Date(item.publishedAt).toLocaleDateString()
    })) || [];
  }
});
```

### 禁用自动更新

```javascript
// 只获取一次数据，不启动自动更新
const staticData = await isrCache.getData('menus', {
  enableAutoUpdate: false
});
```

## 事件监听

### 监听数据更新

```javascript
document.addEventListener('isr-update', (event) => {
  const { endpoint, newData, oldData } = event.detail;
  
  console.log(`${endpoint} 数据已更新`);
  console.log('新数据:', newData);
  console.log('旧数据:', oldData);
  
  // 根据不同接口执行不同操作
  switch (endpoint) {
    case 'menus':
      updateNavigation(newData);
      break;
    case 'news':
      refreshNewsList(newData);
      break;
    case 'products':
      updateProductGrid(newData);
      break;
  }
});
```

## 缓存管理

### 强制刷新

```javascript
// 强制刷新菜单
await isrCache.forceRefresh('menus');

// 强制刷新带参数的数据
await isrCache.forceRefresh('news', { page: 1 });
```

### 清除缓存

```javascript
// 清除所有缓存
isrCache.clearAllCache();

// 停止特定接口的自动更新
isrCache.stopAutoUpdate('products');

// 停止所有自动更新
isrCache.stopAllAutoUpdates();
```

### 获取缓存统计

```javascript
const stats = isrCache.getCacheStats();
console.log('缓存统计:', stats);

/*
输出示例:
{
  totalCaches: 4,
  activeCheckers: 3,
  cacheItems: [
    {
      key: 'menus',
      age: '15s',
      timeout: '30s',
      isExpired: false,
      size: 1024
    },
    // ...
  ]
}
*/
```

## 在组件中使用

### Astro组件示例

```astro
---
import { isrCache } from '../lib/isr-cache.js';

// 服务端获取初始数据
const initialNews = await isrCache.getData('news');
---

<div id="news-container">
  {initialNews.map(item => (
    <article key={item.id}>
      <h3>{item.title}</h3>
      <p>{item.excerpt}</p>
    </article>
  ))}
</div>

<script>
  import { isrCache } from '../lib/isr-cache.js';
  
  // 客户端监听更新
  document.addEventListener('isr-update', (event) => {
    if (event.detail.endpoint === 'news') {
      updateNewsContainer(event.detail.newData);
    }
  });
  
  function updateNewsContainer(newsData) {
    const container = document.getElementById('news-container');
    container.innerHTML = newsData.map(item => `
      <article>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
      </article>
    `).join('');
  }
</script>
```

## 错误处理

### 基本错误处理

```javascript
try {
  const data = await isrCache.getData('products');
  renderProducts(data);
} catch (error) {
  console.error('获取产品失败:', error);
  showErrorMessage('产品加载失败，请稍后重试');
}
```

### 降级策略

```javascript
async function getNewsWithFallback() {
  try {
    // 尝试获取最新数据
    return await isrCache.getData('news');
  } catch (error) {
    // 降级到静态数据
    return getStaticNews();
  }
}
```

## 性能优化

### 预加载数据

```javascript
// 页面加载时预加载关键数据
document.addEventListener('DOMContentLoaded', async () => {
  // 并行预加载多个接口
  await Promise.all([
    isrCache.getData('menus'),
    isrCache.getData('news'),
    isrCache.getData('products')
  ]);
  
  console.log('关键数据预加载完成');
});
```

### 页面可见性优化

缓存管理器会自动监听页面可见性变化，当页面重新可见时会检查所有缓存更新。

## 开发调试

### 开发模式命令

在开发环境下，可以通过浏览器控制台访问：

```javascript
// 全局访问缓存管理器
window.isrCache

// 查看缓存统计
window.isrCache.getCacheStats()

// 强制刷新所有缓存
window.isrCache.clearAllCache()

// 设置缓存策略
window.isrCache.setCacheStrategy('news', 10000) // 10秒

// 手动触发更新检查
window.isrCache.checkAllUpdates()
```

### 日志监控

```javascript
// 启用详细日志
const isrCache = new ISRCacheManager({
  enableLogs: true,
  enableNotifications: true
});

// 禁用通知但保留日志
const isrCache = new ISRCacheManager({
  enableLogs: true,
  enableNotifications: false
});
```

## 最佳实践

### 1. 合理设置缓存时间
- 频繁变化的数据：30秒-1分钟
- 中等变化的数据：5-10分钟
- 稳定的数据：1小时以上

### 2. 错误处理
- 始终包装try-catch
- 提供降级方案
- 给用户友好的错误提示

### 3. 性能考虑
- 避免过度频繁的API调用
- 合理使用预加载
- 监控缓存大小

### 4. 用户体验
- 显示加载状态
- 提供重试按钮
- 无缝的数据更新

## 与传统方案对比

| 特性 | 传统方案 | ISR缓存管理器 |
|------|----------|---------------|
| 更新速度 | 10-30分钟 | 30秒 |
| 用户体验 | 需要刷新页面 | 无刷新更新 |
| 错误处理 | 基础 | 智能重试+降级 |
| 缓存策略 | 单一 | 按接口定制 |
| 开发体验 | 复杂 | 简单统一 |
| 性能优化 | 手动 | 自动 |

通过使用公共ISR缓存管理器，您可以轻松实现现代化的数据缓存和自动更新功能，大幅提升用户体验和开发效率。 