import { generateLanguageSpecificSitemap, generateFullSitemap } from '../lib/sitemapUtils.js';

/**
 * 生成中文站点地图 XML
 * 路由: /sitemap-zh.xml
 */
export async function GET({ request }) {
  try {
    // 从请求中获取域名
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    console.log(`🗺️ 生成中文站点地图 (域名: ${hostname})...`);
    
    // 设置环境变量以便站点地图工具使用
    if (typeof process !== 'undefined' && process.env) {
      process.env.CURRENT_HOSTNAME = hostname;
    }
    
    // 获取所有页面数据
    const sitemapData = await generateFullSitemap();
    
    // 生成中文站点地图
    const zhSitemap = generateLanguageSpecificSitemap(sitemapData.pages, 'zh-CN');
    
    console.log(`✅ 中文站点地图生成完成，包含 ${sitemapData.pages.filter(p => p.lang === 'zh-CN').length} 个页面`);
    
    return new Response(zhSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('❌ 生成中文站点地图失败:', error);
    
    return new Response('Error generating sitemap', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}
