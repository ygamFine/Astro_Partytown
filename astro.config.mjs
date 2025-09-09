// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
import critters from 'astro-critters';

import { getSupportedLanguages } from './src/lib/languageConfig.js';
// 动态获取支持的语言列表
const locales = await getSupportedLanguages();
export default defineConfig({
  adapter: vercel({
    isr: true
  }),
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
    locales,
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false
    }
  },
  // 🔧 集成配置
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    partytown({
      config: {
        forward: [
          // 'dataLayer.push', 
          // 'gtag',
          // 'fbq',
          // 'ga',
          // 'gtm',
          // 'dataLayer',
          // 'google_tag_manager',
          // 'google_analytics',
          // 'google_analytics_v4',
          // 'gtag_v4',
          // 'gtm_v4',
          // 'fbq_v4',
          // 'ga_v4',
          // 'matomo',
          // 'piwik',
          // 'hotjar',
          // 'mixpanel',
          // 'amplitude',
          // 'segment',
          // 'intercom',
          // 'zendesk',
          // 'livechat',
          // 'tawk',
          // 'olark',
          // 'drift',
          // 'crisp',
          // 'freshchat',
          // 'helpcrunch',
          // 'userlike',
          // 'jivochat',
          // 'livezilla',
          // 'zopim',
          // 'snapengage',
          // 'purechat',
          // 'clickdesk',
          // 'comm100',
          // 'liveperson',
          // 'boldchat',
          // 'websitealive',
          // 'livechatinc',
          // 'tidio',
          // 'chatra',
          // 'smartsupp',
          // 'userecho',
          // 'uservoice',
          // 'helpscout',
          // 'freshdesk',
          // 'zendesk_chat',
          // 'intercom_chat',
          // 'drift_chat',
          // 'crisp_chat',
          // 'freshchat_chat',
          // 'helpcrunch_chat',
          // 'userlike_chat',
          // 'jivochat_chat',
          // 'livezilla_chat',
          // 'zopim_chat',
          // 'snapengage_chat',
          // 'purechat_chat',
          // 'clickdesk_chat',
          // 'comm100_chat',
          // 'liveperson_chat',
          // 'boldchat_chat',
          // 'websitealive_chat',
          // 'livechatinc_chat',
          // 'tidio_chat',
          // 'chatra_chat',
          // 'smartsupp_chat',
          // 'userecho_chat',
          // 'uservoice_chat',
          // 'helpscout_chat',
          // 'freshdesk_chat',
          // 'zendesk_chat_chat',
          // 'intercom_chat_chat',
          // 'drift_chat_chat',
          // 'crisp_chat_chat',
          // 'freshchat_chat_chat',
          // 'helpcrunch_chat_chat',
          // 'userlike_chat_chat',
          // 'jivochat_chat_chat',
          // 'livezilla_chat_chat',
          // 'zopim_chat_chat',
          // 'snapengage_chat_chat',
          // 'purechat_chat_chat',
          // 'clickdesk_chat_chat',
          // 'comm100_chat_chat',
          // 'liveperson_chat_chat',
          // 'boldchat_chat_chat',
          // 'websitealive_chat_chat',
          // 'livechatinc_chat_chat',
          // 'tidio_chat_chat',
          // 'chatra_chat_chat',
          // 'smartsupp_chat_chat',
          // 'userecho_chat_chat',
          // 'uservoice_chat_chat',
          // 'helpscout_chat_chat',
          // 'freshdesk_chat_chat'
        ],
        debug: false,
        // 🚀 Partytown 性能优化
        lib: '/~partytown/',
        swPath: 'partytown-sw.js',
        // 允许第三方脚本在 Web Worker 中运行
        allowThirdPartyScripts: true,
        // 启用脚本预加载
        preloadScripts: true,
        // 内存管理优化
        memoryManagement: {
          enabled: true,
          maxScripts: 50,
          maxMemory: 50 * 1024 * 1024 // 50MB
        }
      }
    }),
    // ⚡ 自动提取并内联首屏关键 CSS
    critters({
      Critters: {
        preload: 'swap',
        inlineFonts: true,
        pruneSource: true
      }
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

  // ⚡ Vite 构建优化
  vite: {
    // 支持子目录中的资源文件
    assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          manualChunks: {
            // 核心库分离
            vendor: ['astro'],
            // Pagefind 单独打包
            pagefind: ['@pagefind/default-ui'],
            // 工具库分离
            utils: ['sharp'],
          },
          // 资源优化
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico|mp4|webm|mov/i.test(ext)) {
                return `images/[name]-[hash][extname]`;
              }
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      // 压缩优化
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // 保留 console 用于调试
          drop_debugger: true,
        },
      },
    },
    // 预构建优化
    optimizeDeps: {
      include: ['@pagefind/default-ui'],
    },
    // 开发服务器优化
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
});
