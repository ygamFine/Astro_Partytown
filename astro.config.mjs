// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    tailwind(),
    partytown({
      config: {
        forward: ['dataLayer.push', 'gtag', '_hmt.push', 'HzChat'],
        debug: false,
      }
    }),
  ],
});
