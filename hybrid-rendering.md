# 混合渲染模式配置

## 🎯 目标
将菜单部分改为客户端渲染，实现实时数据更新。

## 🔧 实现方案

### 1. 修改Astro配置

#### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'hybrid', // 混合模式
  experimental: {
    hybridOutput: true
  }
});
```

### 2. 创建客户端菜单组件

#### src/components/DynamicMenu.astro
```astro
---
// 服务端预渲染时不获取数据
export const prerender = false;
---

<div id="dynamic-menu">
  <div class="loading">加载中...</div>
</div>

<script>
import { getMenus } from '../lib/strapi.js';

async function loadMenu() {
  try {
    const menus = await getMenus();
    const menuContainer = document.getElementById('dynamic-menu');
    
    const menuHTML = menus.map(menu => `
      <a href="${menu.path}" 
         class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
        ${menu.name}
      </a>
    `).join('');
    
    menuContainer.innerHTML = menuHTML;
  } catch (error) {
    console.error('菜单加载失败:', error);
    document.getElementById('dynamic-menu').innerHTML = '菜单加载失败';
  }
}

// 页面加载完成后获取菜单
document.addEventListener('DOMContentLoaded', loadMenu);

// 每5分钟刷新一次菜单
setInterval(loadMenu, 5 * 60 * 1000);
</script>
```

### 3. 修改Header组件

#### src/components/Header.astro
```astro
---
// 移除服务端菜单获取
---

<header class="bg-white shadow-sm">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img class="h-8 w-8" src="/favicon.svg" alt="Logo">
        </div>
        
        <!-- 动态菜单 -->
        <div class="ml-10 flex items-baseline space-x-4">
          <DynamicMenu />
        </div>
      </div>
    </div>
  </nav>
</header>
```

## ⏱️ 更新时间线 (混合模式)

1. **0秒**: 在Strapi中修改菜单
2. **立即**: API数据更新
3. **5分钟内**: 客户端自动刷新菜单
4. **实时**: 新访问用户看到最新菜单

## 🎯 优势
- ✅ 接近实时更新
- ✅ 无需重新构建
- ✅ 自动刷新机制
- ✅ 降级处理

## ⚠️ 注意事项
- 需要JavaScript支持
- 初次加载稍慢
- SEO影响较小(仅菜单部分) 