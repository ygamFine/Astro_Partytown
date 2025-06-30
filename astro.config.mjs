// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://astro-partytown.vercel.app',
  integrations: [
    tailwind(),
    partytown({
      // Partytown配置优化
      config: {
        forward: ['dataLayer.push'],
        debug: false,
      },
    }),
  ],
  build: {
    // 性能优化选项
    inlineStylesheets: 'auto',
    assets: 'assets'
  },
  vite: {
    build: {
      // 优化构建
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  }
});
