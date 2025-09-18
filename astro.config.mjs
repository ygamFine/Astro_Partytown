// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
import critters from 'astro-critters';
import sitemap from '@astrojs/sitemap';


import { getSupportedLanguages } from './src/utils/languageConfig';

// 动态获取支持的语言列表
const locales = await getSupportedLanguages();

const localesObject = Object.assign({}, ...locales.map(k => ({[k]: k})))
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
        // 设置日志级别为 warn，减少错误输出
        logLevel: 'warn',
        // 设置外部文件阈值，避免处理有问题的文件
        inlineThreshold: 0,
        // 禁用压缩，避免处理错误
        compress: false
      }
    }),
    sitemap({
      i18n: {
        defaultLocale: process.env.PUBLIC_DEFAULT_LOCALE || "en",
        locales: localesObject,
      },
    }),
  ],

  // 🖼️ 图片优化配置
  image: {
    domains: ["astro.build"],
    remotePatterns: [{ protocol: "http" }],
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
  },

  // 🏗️ 构建优化配置
  build: {
    assets: '_astro',
    // 内联小资源
    inlineStylesheets: 'auto',
  },

  // 📁 静态资源配置
  publicDir: 'public',

  // 📤 输出配置
  output: 'static',

  // // ⚡ Vite 构建优化
  // vite: {
  //   // 支持子目录中的资源文件
  //   assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  //   build: {
  //     // 代码分割优化
  //     rollupOptions: {
  //       output: {
  //         manualChunks: {
  //           // 核心库分离
  //           vendor: ['astro'],
  //           // Pagefind 单独打包
  //           pagefind: ['@pagefind/default-ui'],
  //           // 工具库分离
  //           utils: ['sharp'],
  //         },
  //         // 资源优化
  //         assetFileNames: (assetInfo) => {
  //           if (assetInfo.name) {
  //             const info = assetInfo.name.split('.');
  //             const ext = info[info.length - 1];
  //             if (/png|jpe?g|svg|gif|tiff|bmp|ico|mp4|webm|mov/i.test(ext)) {
  //               return `images/[name]-[hash][extname]`;
  //             }
  //           }
  //           return `assets/[name]-[hash][extname]`;
  //         },
  //       },
  //     },
  //     // 压缩优化
  //     minify: 'terser',
  //     terserOptions: {
  //       compress: {
  //         drop_console: false, // 保留 console 用于调试
  //         drop_debugger: true,
  //       },
  //     },
  //   },
  //   // 预构建优化
  //   optimizeDeps: {
  //     include: ['@pagefind/default-ui'],
  //   },
  //   // 开发服务器优化
  //   server: {
  //     hmr: {
  //       overlay: false,
  //     },
  //   },
  // },
});
