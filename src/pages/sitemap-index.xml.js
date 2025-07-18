import { generateSitemapIndexXML } from '../lib/sitemapUtils.js';

// 主函数
export async function GET() {
  try {
    console.log('🚀 生成站点地图索引...');
    
    const sitemapIndexXML = generateSitemapIndexXML();
    
    console.log('✅ 站点地图索引生成完成!');
    
    return new Response(sitemapIndexXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // 缓存1小时
      }
    });
    
  } catch (error) {
    console.error('❌ 生成站点地图索引失败:', error);
    
    // 返回基本的站点地图索引
    const basicXML = generateSitemapIndexXML();
    
    return new Response(basicXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
} 