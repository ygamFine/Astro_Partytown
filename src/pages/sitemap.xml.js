import { generateFullSitemap } from '../lib/sitemapUtils.js';

/**
 * 生成站点地图 XML
 * 根据请求域名动态生成对应的站点地图
 */
export async function GET({ request }) {
  try {
    // 从请求中获取域名
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    console.log(`🗺️ 生成站点地图 (域名: ${hostname})...`);
    
    // 设置环境变量以便站点地图工具使用
    if (typeof process !== 'undefined' && process.env) {
      process.env.CURRENT_HOSTNAME = hostname;
    }
    
    const sitemapData = await generateFullSitemap();
    
    console.log(`✅ 站点地图生成完成，包含 ${sitemapData.pages.length} 个页面`);
    
    return new Response(sitemapData.xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('❌ 生成站点地图失败:', error);
    
    // 返回错误响应
    return new Response('Error generating sitemap', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 