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
      // 配置Partytown
      config: {
        // 允许的第三方脚本域名
        forward: ['dataLayer.push', 'gtag', '_hmt.push'],
        // 调试模式（生产环境可以关闭）
        debug: false,
        // 允许的脚本域名
        resolveUrl: function(url) {
          // Google Analytics
          if (url.hostname === 'www.googletagmanager.com') {
            return url;
          }
          // 华智云客服
          if (url.hostname === 'cdn.huazhi.cloud') {
            return url;
          }
          // 其他第三方脚本
          return url;
        }
      }
    }),
  ],
});
