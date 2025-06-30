// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://astro-partytown.vercel.app',
  integrations: [
    tailwind(),
  ],
  build: {
    // 性能优化选项
    inlineStylesheets: 'auto', // 自动内联小的CSS文件
    assets: 'assets' // 优化资源文件名
  },
  vite: {
    build: {
      // 优化构建
      cssCodeSplit: false, // 不分割CSS，生成一个文件
      rollupOptions: {
        output: {
          // 优化chunk大小
          manualChunks: undefined
        }
      }
    }
  }
});
