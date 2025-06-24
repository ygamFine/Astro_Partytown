// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    partytown({
          config: {
      debug: false, // 关闭调试模式
        forward: [
          'dataLayer.push',
          'gtag'
        ],
        // 🚀 简化配置：JS脚本直接加载
        resolveUrl: function(url, location, type) {
          // 所有脚本直接加载，不使用代理
          console.log(`📥 Partytown加载脚本: ${url.href}`);
          return url;
        },
        logCalls: false,
        logGetters: false,
        logSetters: false,
        logImageRequests: false,
        logSendBeaconRequests: false,
        logStackTraces: false
      },
    }),
  ],
  // 性能优化配置
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 将Partytown相关代码分离到单独的chunk
            partytown: ['@builder.io/partytown']
          }
        }
      }
    }
  }
});
