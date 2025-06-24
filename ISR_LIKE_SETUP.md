# 🔄 类似Next.js ISR的自定义更新时间配置

## 🎯 目标
实现类似Next.js ISR的功能，支持30秒、1分钟或任意时间间隔的内容更新。

---

## 🚀 方案1: 混合渲染 + 客户端缓存 (推荐)

### 1.1 修改Astro配置支持混合渲染

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'hybrid', // 启用混合模式
  experimental: {
    hybridOutput: true
  }
});
```

### 1.2 创建智能缓存菜单组件

```astro
---
// src/components/SmartMenu.astro
// 这个组件支持客户端缓存和定时刷新
export const prerender = false; // 禁用预渲染，使其在客户端运行
---

<div id="smart-menu" class="menu-container">
  <div class="loading-indicator">加载菜单中...</div>
</div>

<script>
  class SmartMenuManager {
    constructor() {
      this.cacheKey = 'strapi_menu_cache';
      this.lastUpdateKey = 'strapi_menu_last_update';
      this.cacheTimeout = 30000; // 30秒缓存时间 (可自定义)
      this.retryInterval = 5000; // 5秒重试间隔
      this.maxRetries = 3;
      
      this.init();
    }
    
    init() {
      this.loadMenu();
      this.startPeriodicUpdate();
    }
    
    // 获取缓存的菜单数据
    getCachedMenu() {
      const cached = localStorage.getItem(this.cacheKey);
      const lastUpdate = localStorage.getItem(this.lastUpdateKey);
      
      if (!cached || !lastUpdate) return null;
      
      const cacheAge = Date.now() - parseInt(lastUpdate);
      if (cacheAge > this.cacheTimeout) {
        return null; // 缓存过期
      }
      
      return JSON.parse(cached);
    }
    
    // 缓存菜单数据
    setCachedMenu(menuData) {
      localStorage.setItem(this.cacheKey, JSON.stringify(menuData));
      localStorage.setItem(this.lastUpdateKey, Date.now().toString());
    }
    
    // 从Strapi API获取菜单
    async fetchMenuFromAPI() {
      const response = await fetch('/api/menu-proxy'); // 通过代理避免CORS
      if (!response.ok) throw new Error('API请求失败');
      return response.json();
    }
    
    // 加载菜单 (优先使用缓存)
    async loadMenu() {
      try {
        // 1. 先尝试使用缓存
        const cachedMenu = this.getCachedMenu();
        if (cachedMenu) {
          this.renderMenu(cachedMenu);
          console.log('📋 使用缓存菜单数据');
          return;
        }
        
        // 2. 缓存过期或不存在，从API获取
        console.log('🔄 从API获取最新菜单数据...');
        const freshMenu = await this.fetchMenuFromAPI();
        this.setCachedMenu(freshMenu);
        this.renderMenu(freshMenu);
        
      } catch (error) {
        console.error('❌ 菜单加载失败:', error);
        this.handleLoadError();
      }
    }
    
    // 渲染菜单到页面
    renderMenu(menuData) {
      const container = document.getElementById('smart-menu');
      const menuHTML = menuData.map(item => `
        <a href="${item.path}" 
           class="menu-item text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
          ${item.name}
        </a>
      `).join('');
      
      container.innerHTML = `
        <nav class="flex items-center space-x-4">
          ${menuHTML}
        </nav>
        <div class="cache-info text-xs text-gray-400 mt-1">
          最后更新: ${new Date().toLocaleTimeString()}
        </div>
      `;
    }
    
    // 处理加载错误
    handleLoadError() {
      const container = document.getElementById('smart-menu');
      container.innerHTML = `
        <div class="error-message text-red-500">
          菜单加载失败，<button onclick="smartMenu.loadMenu()" class="underline">点击重试</button>
        </div>
      `;
    }
    
    // 启动定期更新
    startPeriodicUpdate() {
      setInterval(() => {
        console.log('🔄 定期检查菜单更新...');
        this.checkForUpdates();
      }, this.cacheTimeout);
    }
    
    // 检查是否有更新
    async checkForUpdates() {
      try {
        const freshMenu = await this.fetchMenuFromAPI();
        const cachedMenu = this.getCachedMenu();
        
        // 比较数据是否有变化
        if (!cachedMenu || JSON.stringify(freshMenu) !== JSON.stringify(cachedMenu)) {
          console.log('✨ 发现菜单更新，刷新缓存');
          this.setCachedMenu(freshMenu);
          this.renderMenu(freshMenu);
          
          // 显示更新提示
          this.showUpdateNotification();
        }
      } catch (error) {
        console.warn('⚠️ 检查更新失败:', error);
      }
    }
    
    // 显示更新通知
    showUpdateNotification() {
      const notification = document.createElement('div');
      notification.className = 'update-notification fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = '菜单已更新 ✨';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }
  
  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', () => {
    window.smartMenu = new SmartMenuManager();
  });
</script>

<style>
  .menu-container {
    min-height: 40px;
  }
  
  .loading-indicator {
    color: #6b7280;
    font-size: 14px;
  }
  
  .menu-item {
    transition: all 0.2s ease;
  }
  
  .menu-item:hover {
    transform: translateY(-1px);
  }
  
  .update-notification {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
```

### 1.3 创建API代理端点

```javascript
// src/pages/api/menu-proxy.js
export const prerender = false;

export async function GET({ request }) {
  try {
    const response = await fetch('http://47.251.126.80/api/menus', {
      headers: {
        'Authorization': 'Bearer 2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Strapi API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 转换为标准格式
    const menus = data.data?.map(item => ({
      name: item.name,
      path: item.path,
      publishedAt: item.publishedAt
    })) || [];
    
    return new Response(JSON.stringify(menus), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('API代理错误:', error);
    
    return new Response(JSON.stringify({ 
      error: 'API请求失败',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
```

---

## 🚀 方案2: 定时重新生成 (Vercel Cron Jobs)

### 2.1 创建定时构建API

```javascript
// src/pages/api/rebuild.js
export const prerender = false;

export async function POST({ request }) {
  try {
    // 验证请求来源 (可选)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer YOUR_SECRET_TOKEN') {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 触发Vercel重新部署
    const webhookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!webhookUrl) {
      throw new Error('未配置部署Hook URL');
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'scheduled-rebuild',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: '重新构建已触发',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error(`部署触发失败: ${response.status}`);
    }
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### 2.2 配置Vercel Cron Jobs

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "astro",
  "crons": [
    {
      "path": "/api/rebuild",
      "schedule": "*/30 * * * * *"
    }
  ]
}
```

**Cron表达式说明:**
- `*/30 * * * * *` - 每30秒执行一次
- `*/1 * * * *` - 每1分钟执行一次  
- `*/5 * * * *` - 每5分钟执行一次
- `0 */1 * * *` - 每1小时执行一次

---

## 🚀 方案3: 客户端智能缓存 (最轻量)

### 3.1 创建可配置的缓存策略

```javascript
// src/lib/smart-cache.js
export class SmartCache {
  constructor(options = {}) {
    this.cacheTimeout = options.timeout || 30000; // 默认30秒
    this.apiUrl = options.apiUrl || '/api/menu-proxy';
    this.storageKey = options.storageKey || 'smart_cache';
    this.callbacks = options.callbacks || {};
  }
  
  // 获取数据 (优先缓存)
  async getData() {
    const cached = this.getCached();
    if (cached && !this.isExpired(cached)) {
      this.callbacks.onCacheHit?.(cached.data);
      return cached.data;
    }
    
    try {
      const fresh = await this.fetchFresh();
      this.setCache(fresh);
      this.callbacks.onFreshData?.(fresh);
      return fresh;
    } catch (error) {
      this.callbacks.onError?.(error);
      return cached?.data || null;
    }
  }
  
  // 获取缓存
  getCached() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  // 设置缓存
  setCache(data) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      timeout: this.cacheTimeout
    };
    localStorage.setItem(this.storageKey, JSON.stringify(cacheItem));
  }
  
  // 检查是否过期
  isExpired(cached) {
    return (Date.now() - cached.timestamp) > cached.timeout;
  }
  
  // 获取新数据
  async fetchFresh() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) throw new Error('API请求失败');
    return response.json();
  }
  
  // 清除缓存
  clearCache() {
    localStorage.removeItem(this.storageKey);
  }
  
  // 强制刷新
  async forceRefresh() {
    this.clearCache();
    return this.getData();
  }
}
```

### 3.2 使用智能缓存

```astro
---
// src/components/CachedMenu.astro
---

<div id="cached-menu">
  <div class="loading">加载中...</div>
</div>

<div class="cache-controls">
  <button id="refresh-btn" class="btn-refresh">刷新菜单</button>
  <span id="cache-status" class="cache-status"></span>
</div>

<script>
  import { SmartCache } from '../lib/smart-cache.js';
  
  const menuCache = new SmartCache({
    timeout: 30000, // 30秒缓存
    apiUrl: '/api/menu-proxy',
    storageKey: 'menu_cache',
    callbacks: {
      onCacheHit: (data) => {
        console.log('📋 使用缓存数据');
        updateStatus('使用缓存 (30秒内有效)');
      },
      onFreshData: (data) => {
        console.log('🔄 获取到新数据');
        updateStatus('数据已更新');
      },
      onError: (error) => {
        console.error('❌ 获取数据失败:', error);
        updateStatus('获取失败，使用缓存');
      }
    }
  });
  
  async function loadMenu() {
    const menuData = await menuCache.getData();
    if (menuData) {
      renderMenu(menuData);
    }
  }
  
  function renderMenu(menuData) {
    const container = document.getElementById('cached-menu');
    const menuHTML = menuData.map(item => `
      <a href="${item.path}" class="menu-link">${item.name}</a>
    `).join('');
    container.innerHTML = menuHTML;
  }
  
  function updateStatus(message) {
    const status = document.getElementById('cache-status');
    status.textContent = message;
    status.className = 'cache-status updated';
    setTimeout(() => {
      status.className = 'cache-status';
    }, 2000);
  }
  
  // 刷新按钮
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    const fresh = await menuCache.forceRefresh();
    renderMenu(fresh);
  });
  
  // 页面加载时初始化
  document.addEventListener('DOMContentLoaded', loadMenu);
  
  // 定期检查更新 (可选)
  setInterval(loadMenu, 30000); // 每30秒检查一次
</script>

<style>
  .cache-controls {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .btn-refresh {
    padding: 4px 8px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .cache-status {
    font-size: 12px;
    color: #6b7280;
    transition: color 0.3s;
  }
  
  .cache-status.updated {
    color: #10b981;
  }
</style>
```

---

## 📊 自定义时间间隔配置

### 可配置的时间选项

```javascript
// 时间配置选项
const TIME_OPTIONS = {
  REAL_TIME: 5000,      // 5秒 (接近实时)
  FAST: 30000,          // 30秒 (您要求的)
  NORMAL: 60000,        // 1分钟
  SLOW: 300000,         // 5分钟
  HOURLY: 3600000,      // 1小时
  DAILY: 86400000       // 24小时
};

// 使用示例
const cache = new SmartCache({
  timeout: TIME_OPTIONS.FAST, // 30秒
  // 其他配置...
});
```

### 动态时间配置

```javascript
// 根据内容类型调整缓存时间
function getOptimalCacheTime(contentType) {
  switch(contentType) {
    case 'menu': return 30000;        // 菜单30秒
    case 'news': return 60000;        // 新闻1分钟  
    case 'products': return 300000;   // 产品5分钟
    case 'company': return 3600000;   // 公司信息1小时
    default: return 30000;
  }
}
```

---

## 🎯 推荐方案

**对于您的需求 (30秒更新)，我推荐使用方案1+方案3的组合:**

1. **混合渲染**: 菜单部分使用客户端渲染
2. **智能缓存**: 30秒缓存 + 自动更新检测
3. **Webhook保留**: 作为备用的强制更新机制

这样可以实现:
- ✅ **30秒内更新**: 客户端自动检测
- ✅ **用户体验**: 无刷新更新
- ✅ **性能优化**: 智能缓存减少API调用
- ✅ **可靠性**: 多重更新机制保障

您希望我帮您实现哪个方案？ 