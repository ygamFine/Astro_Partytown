import { generateSitemapIndexXML } from '../lib/sitemapUtils.js';

/**
 * 生成站点地图索引 XML
 * 路由: /sitemap-index.xml
 */
export async function GET({ request }) {
  try {
    // 从请求中获取域名
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // 设置环境变量以便站点地图工具使用
    if (typeof process !== 'undefined' && process.env) {
      process.env.CURRENT_HOSTNAME = hostname;
    }
    
    console.log(`📋 生成站点地图索引 (域名: ${hostname})...`);
    
    // 生成站点地图索引
    const sitemapIndexXML = generateSitemapIndexXML();
    
    console.log('✅ 站点地图索引生成完成');
    
    return new Response(sitemapIndexXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${import.meta.env.CACHE_MAX_AGE || 3600}` // 缓存时间
      }
    });
    
  } catch (error) {
    console.error('❌ 生成站点地图索引失败:', error);
    
    // 返回错误响应
    return new Response('Error generating sitemap index', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}
