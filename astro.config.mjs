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
      debug: false, // 关闭调试模式
        forward: [
          'dataLayer.push',
          'gtag',
          '_hmt.push',
          'CustomerService.init',
          'CustomerService.showChat',
          'hbspt.forms.create'
        ],
        // 🚀 CORS解决方案：配置代理URL解析
        resolveUrl: function(url, location, type) {
          // 华智云域名的所有资源（JS、CSS等）通过代理加载
          if (url.hostname === 'matomocdn.huazhi.cloud' || 
              url.hostname === 'cdn.huazhi.cloud' ||
              url.hostname === 'huazhicloud.oss-cn-beijing.aliyuncs.com' ||
              url.hostname === 'api.huazhi.cloud') {
            const proxyUrl = new URL('/api/proxy', location.origin);
            proxyUrl.searchParams.set('url', url.href);
            return proxyUrl;
          }
          
          // 其他脚本正常加载
          return url;
        },
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
