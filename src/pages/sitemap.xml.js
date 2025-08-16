import { generateFullSitemap } from '../lib/sitemapUtils.js';

/**
 * 生成站点地图 XML
 * 根据请求域名动态生成对应的站点地图
 */
export async function GET({ request }) {
  // 从请求中获取域名
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // 设置环境变量以便站点地图工具使用
  if (typeof process !== 'undefined' && process.env) {
    process.env.CURRENT_HOSTNAME = hostname;
  }
  
  const sitemapData = await generateFullSitemap();
  
  return new Response(sitemapData.xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
} 