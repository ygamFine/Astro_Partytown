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
    // ⚡ Partytown 配置 - 将第三方脚本移至 Web Worker
    partytown({
      config: {
        forward: ['dataLayer.push'],
        // 将 Swiper 相关脚本移至 Web Worker
        lib: '/~partytown/',
      },
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

  // ⚡ Vite 优化配置
  vite: {
    build: {
      // 启用压缩
      minify: 'terser',
      terserOptions: {
        compress: {
          // 移除 console.log
          drop_console: true,
          // 移除 debugger
          drop_debugger: true,
          // 移除未使用的代码
          dead_code: true,
        },
      },
      // 启用代码分割和摇树优化
      rollupOptions: {
        output: {
          // 按模块分割代码，减少单个文件大小
          manualChunks: (id) => {
            // 将 Swiper 单独打包
            if (id.includes('swiper')) {
              return 'swiper';
            }
            // 将 React 相关库单独打包
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // 将 node_modules 中的其他库单独打包
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // 优化文件名生成
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'entry/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          // 进一步优化代码分割
          experimentalMinChunkSize: 1000,
        }
      }
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['swiper/bundle'],
      exclude: ['@astrojs/partytown']
    }
  },
  // 🏗️ 构建优化配置 - 强制内联所有样式，彻底解决重复问题
  build: {
    assets: '_astro',
    // 强制内联所有样式，避免生成多个重复的 CSS 文件
    inlineStylesheets: 'always',
    format: 'directory',
  },

  // 📁 静态资源配置
  publicDir: 'public',

  // 📤 输出配置
  output: 'static',
});
