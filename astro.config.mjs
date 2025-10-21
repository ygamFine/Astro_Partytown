// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import { getSupportedLanguages } from './src/utils/languageConfig';

// 动态获取支持的语言列表
const locales = await getSupportedLanguages();

export default defineConfig({
  // 生成站点地图
  site: process.env.PUBLIC_SITE_URL,
  // 使用Vercel适配器支持API路由
  adapter: vercel(),
  server: {
    host: true,
  },
  devToolbar: {
    enabled: true
  },

  // 🌍 国际化配置
  i18n: {
    locales: locales,
    defaultLocale: process.env.PUBLIC_DEFAULT_LOCALE || "en",
    routing: {
      prefixDefaultLocale: false,
      // redirectToDefaultLocale: false,
      
    }
  },
  // 🔧 集成配置
  integrations: [
    react(),
    tailwind({
      // 官方推荐：让 Astro 统一管理基础样式
      applyBaseStyles: false,
      configFile: './tailwind.config.js',
    }),
    // 🚀 启用 Partytown 来优化第三方脚本性能
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: import.meta.env.DEV
      }
    }),
  ],
  // 🖼️ 图片优化配置
  image: {
    domains: ["astro.build", "localhost:4321", "192.168.7.249:4321"],
    remotePatterns: [
      { protocol: "http" },
      { protocol: "https" }
    ],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
         limitInputPixels: false,
      },
    }
  },
});
