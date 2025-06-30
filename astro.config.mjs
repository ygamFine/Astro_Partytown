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
        },
        mangle: {
          safari10: true,
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
      preprocessorOptions: {
        sourceMap: false,
      },
    },
  },
  
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    domains: ['localhost'],
  },
  
  experimental: {
    optimizeHoistedScript: true,
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
