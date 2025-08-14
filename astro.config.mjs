// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  adapter: vercel({
    isr: true
  }),
  
  server: {
    port: 3000,
    host: true,
  },
  i18n: {
    locales: [
      "en", "zh-CN", "zh-Hant", "fr", "de", "it", "tr", "es", "pt-pt", 
      "nl", "pl", "ar", "ru", "th", "id", "vi", "ms", "ml", "my", "hi", "ja", "ko"
    ],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false
    }
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
  
  // 静态资源配置
  publicDir: 'public',
  
  // 输出配置
  output: 'static',
  
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
