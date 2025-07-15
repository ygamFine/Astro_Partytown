// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: {
    port: 3000,
    host: true,
  },
  // 重定向规则 - 将非多语言路径重定向到默认语言
  redirects: {
    '/products': '/zh-hans/products',
    '/about': '/zh-hans/about',
    '/contact': '/zh-hans/contact',
    '/case': '/zh-hans/case',
    '/news': '/zh-hans/news',
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
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  // SSG优化配置
  build: {
    assets: '_astro',
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
