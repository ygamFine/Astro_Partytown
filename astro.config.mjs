// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: {
    port: 3333,
    host: true,
  },
  // 重定向规则 - 将非多语言路径重定向到默认语言
  redirects: {
    '/products': '/zh-hans/products',
    '/about': '/zh-hans/about',
    '/contact': '/zh-hans/contact',
    '/case': '/zh-hans/case',
    '/news': '/zh-hans/news',
  },

  // 移除内置i18n配置，因为我们使用手动实现的多语言路由
  // i18n: {
  //   defaultLocale: "en",
  //   locales: ["es", "en", "pt-br"],
  //   routing: {
  //     prefixDefaultLocale: true
  //   },
  // },
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
        debug: false,
      }
    }),
  ],
});
