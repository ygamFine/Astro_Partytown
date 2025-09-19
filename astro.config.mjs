// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
import critters from 'astro-critters';


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
    tailwind({
      applyBaseStyles: true,
    }),
    // ⚡ 自动提取并内联首屏关键 CSS
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
    }),
  ],

  // 🖼️ 图片优化配置
  image: {
    domains: ["astro.build"],
    remotePatterns: [{ protocol: "http" }],
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
  // 🏗️ 构建优化配置
  build: {
    assets: '_astro',
    // 内联小资源
    inlineStylesheets: 'auto',
    format: 'directory', // 输出格式
    concurrency: 4, // 控制构建并发数，根据CPU核心数调整
  },

  // 📁 静态资源配置
  publicDir: 'public',

  // 📤 输出配置
  output: 'static',
});
