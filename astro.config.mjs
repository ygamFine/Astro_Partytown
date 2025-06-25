// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server', // 服务器模式支持API端点
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  integrations: [
    tailwind(),
  ],
});
