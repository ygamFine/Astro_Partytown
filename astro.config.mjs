// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import { getSupportedLanguages } from './src/utils/languageConfig';

// 动态获取支持的语言列表
const locales = await getSupportedLanguages();
console.log('默认支持的语言', locales)
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
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
      
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
  // experimental: {
  //   // 只保留 5.13.8 版本中明确存在的实验性特性
  //   contentIntellisense: true, // 内容集合的智能提示支持
  //   liveContentCollections: true, // 内容集合的实时更新
  //   staticImportMetaEnv: true, // 静态导入环境变量
  // },
  // // 🏗️ 构建优化配置 - 强制内联所有样式，彻底解决重复问题
  // build: {
  //   assets: '_astro',
  //   // 强制内联所有样式，避免生成多个重复的 CSS 文件
  //   inlineStylesheets: 'always',
  //   format: 'directory',
  // },

  // // 📁 静态资源配置
  // publicDir: 'public',

  // // 📤 输出配置 - 服务端渲染模式，支持API路由
  // output: 'static',
});
