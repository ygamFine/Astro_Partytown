import { generateFullSitemap } from '../lib/sitemapUtils.js';

/**
 * 生成站点地图 XML
 * 参考标准: https://www.sitemaps.org/protocol.html
 */
export async function GET() {
  try {
  
    
    // 使用工具函数生成完整站点地图
    const sitemapData = await generateFullSitemap();
    
    
    
    return new Response(sitemapData.xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${import.meta.env.CACHE_MAX_AGE || 3600}` // 缓存时间
      }
    });
    
  } catch (error) {
    // 返回基本的站点地图
    const { generateStaticPages, generateSitemapXML } = await import('../lib/sitemapUtils.js');
    const basicPages = generateStaticPages();
    const basicXML = generateSitemapXML(basicPages);
    
    return new Response(basicXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${import.meta.env.CACHE_MAX_AGE}`
      }
    });
  }
} 