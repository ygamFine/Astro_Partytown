// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel({
    // 启用ISR（增量静态再生）
    isr: {
      // 绕过令牌，用于强制重新生成页面
      bypassToken: process.env.BYPASS_TOKEN || "your-bypass-token-here",
      
      // 排除不需要ISR的路径
      exclude: [
        '/preview',
        '/auth/[page]',
        /^\/api\/.+/
      ]
    },
    
    // 包含必要的文件
    includeFiles: [
      './src/data/strapi-image-mapping.json'
    ],
    
    // 排除不需要的文件
    excludeFiles: [
      './scripts/**',
      './.env*'
    ]
  }),
  
  server: {
    port: parseInt(import.meta.env.DEV_SERVER_PORT) || 3000,
    host: import.meta.env.DEV_SERVER_HOST === 'true',
  },
  
  // 重定向规则 - 将非多语言路径重定向到默认语言
  redirects: {
    '/': '/en/',
    '/products': '/en/products',
    '/about': '/en/about',
    '/contact': '/en/contact',
    '/case': '/en/case',
    '/news': '/en/news',
  },
  
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
        debug: false,
      }
    }),
  ],
  
  // 图片优化配置
  image: {
    service: {
      entrypoint: import.meta.env.IMAGE_SERVICE || 'astro/assets/services/sharp'
    }
  },
  
  // SSG优化配置
  build: {
    assets: import.meta.env.BUILD_ASSETS || '_astro',
  },
  
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro'],
          },
        },
      },
    },
  },
});
