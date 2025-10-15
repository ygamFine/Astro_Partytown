// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
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
    react(),
    tailwind({
      applyBaseStyles: true,
    }),
    // ⚡ 自动提取并内联首屏关键 CSS - Astro 官方推荐
    critters({
      Critters: {
        preload: 'swap',
        inlineFonts: false, // 避免字体内联导致的问题
        pruneSource: true,
        logLevel: 'silent',
        inlineThreshold: 0,
        compress: true, // 启用压缩
        mergeStylesheets: true, // 合并样式表
        reduceInlineStyles: true // 减少内联样式
      }
    }),
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
  // 🏗️ 构建优化配置
  build: {
    assets: '_astro',
    // 内联小资源 - Astro 官方推荐的 CSS 优化
    inlineStylesheets: 'auto',
    format: 'directory', // 输出格式
  },
  
  // 🎯 Vite 配置 - 优化 CSS 处理
  vite: {
    build: {
      // CSS 代码分割
      cssCodeSplit: true,
      // 启用 CSS 压缩
      cssMinify: true,
      rollupOptions: {
        output: {
          // 将小的 CSS 文件内联到 HTML 中
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return '_astro/[name].[hash][extname]';
            }
            return '_astro/[name].[hash][extname]';
          }
        }
      }
    },
    css: {
      // 启用 CSS 压缩
      postcss: {
        plugins: []
      }
    }
  },

  // 📁 静态资源配置
  publicDir: 'public',

  // 📤 输出配置
  output: 'static',
});
