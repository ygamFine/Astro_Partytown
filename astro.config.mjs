// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
// import critters from 'astro-critters';


import { getSupportedLanguages } from './src/utils/languageConfig';

// 动态获取支持的语言列表
const locales = await getSupportedLanguages();

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  adapter: vercel({
    isr: true
  }),
  trailingSlash: 'ignore',
  server: {
    port: 3000,
    host: true,
  },
  // 禁用 Astro Dev Toolbar
  devToolbar: {
    enabled: false
  },

  // 🌍 国际化配置
  i18n: {
    locales: locales,
    defaultLocale: process.env.PUBLIC_DEFAULT_LOCALE || "en",
    routing: {
      prefixDefaultLocale: false
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
    /* // ⚡ 自动提取并内联首屏关键 CSS
    critters({
      Critters: {
        preload: 'swap',
        inlineFonts: true,
        pruneSource: true,
        // 设置日志级别为 silent，减少警告输出
        logLevel: 'silent',
        // 设置外部文件阈值，避免处理有问题的文件
        inlineThreshold: 0,
        // 禁用压缩，避免处理错误
        compress: false,
        // 忽略错误继续处理
        mergeStylesheets: false,
        // 减少对复杂选择器的处理
        reduceInlineStyles: false
      }
    }), */
  ],

  // 🖼️ 图片优化配置
  image: {
    domains: ["astro.build"],
    remotePatterns: [
      { protocol: "http" },
      { protocol: "https" }
    ],
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  experimental: {
    // 只保留 5.13.8 版本中明确存在的实验性特性
    contentIntellisense: true, // 内容集合的智能提示支持
    liveContentCollections: true, // 内容集合的实时更新
    staticImportMetaEnv: true, // 静态导入环境变量
  },
  // 🏗️ 构建优化配置 - 符合 Astro 官方最佳实践
  build: {
    assets: '_astro',
    // 官方推荐：控制样式表内联策略
    inlineStylesheets: 'never', // 始终将样式表作为外部文件，避免重复内联
    format: 'directory',
  },

  // 📁 静态资源配置
  publicDir: 'public',

  // 📤 输出配置
  output: 'static',
});
