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
        debug: false,
        // 转发第三方脚本需要的全局变量和函数
        forward: [
          'dataLayer.push',
          'gtag',
          '_hmt.push',
          'CustomerService.init',
          'CustomerService.showChat',
          'hbspt.forms.create'
        ],
        // 启用更多优化选项
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
