// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
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
  adapter: vercel(),
  
  build: {
    inlineStylesheets: 'always',
  },
  
  vite: {
    build: {
      cssCodeSplit: false,
      
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
          passes: 3,
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_proto: true,
          unsafe_regexp: true,
        },
        mangle: {
          safari10: true,
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
      
      assetsInlineLimit: 8192,
      
      chunkSizeWarningLimit: 1000,
      
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['@astrojs/partytown'],
          },
        },
      },
    },
    
    optimizeDeps: {
      include: [],
      exclude: ['@astrojs/partytown'],
    },
    
    css: {
      devSourcemap: false,
    },
  },
  
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: 268402689,
      },
    },
    domains: ['localhost'],
  },
  
  server: {
    port: 4321,
    host: true,
  },
  
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
