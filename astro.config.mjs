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
});
