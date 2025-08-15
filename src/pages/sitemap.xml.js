import { generateFullSitemap } from '../lib/sitemapUtils.js';

/**
 * 生成站点地图 XML
 */
export async function GET() {
  const sitemapData = await generateFullSitemap();
  
  return new Response(sitemapData.xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
} 