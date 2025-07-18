import { generateFullSitemap } from '../lib/sitemapUtils.js';



// 主函数
export async function GET() {
  try {
    console.log('🚀 开始生成站点地图...');
    
    // 使用工具函数生成完整站点地图
    const sitemapData = await generateFullSitemap();
    
    console.log('✅ 站点地图生成完成!');
    console.log(`📊 统计信息:`, sitemapData.stats);
    
    return new Response(sitemapData.xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // 缓存1小时
      }
    });
    
  } catch (error) {
    console.error('❌ 生成站点地图失败:', error);
    
    // 返回基本的站点地图
    const { generateStaticPages, generateSitemapXML } = await import('../lib/sitemapUtils.js');
    const basicPages = generateStaticPages();
    const basicXML = generateSitemapXML(basicPages);
    
    return new Response(basicXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
} 