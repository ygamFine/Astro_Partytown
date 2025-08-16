import { generateLanguageSpecificSitemap, generateFullSitemap } from '../lib/sitemapUtils.js';
import { SUPPORTED_LANGUAGES } from '../lib/i18n-routes.js';

/**
 * 生成按语言分组的站点地图 XML
 * 路由: /sitemap-[lang].xml
 */
export async function GET({ params, request }) {
  try {
    const { lang } = params;
    
    // 验证语言参数
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.log(`❌ 不支持的语言: ${lang}`);
      return new Response('Language not supported', { status: 404 });
    }
    
    // 从请求中获取域名
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // 设置环境变量以便站点地图工具使用
    if (typeof process !== 'undefined' && process.env) {
      process.env.CURRENT_HOSTNAME = hostname;
    }
    
    console.log(`🗺️ 生成 ${lang} 语言站点地图 (域名: ${hostname})...`);
    
    // 获取所有页面数据
    const sitemapData = await generateFullSitemap();
    
    // 生成指定语言的站点地图
    const languageSitemap = generateLanguageSpecificSitemap(sitemapData.pages, lang);
    
    console.log(`✅ ${lang} 语言站点地图生成完成，包含 ${sitemapData.pages.filter(p => p.lang === lang).length} 个页面`);
    
    return new Response(languageSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, max-age=${import.meta.env.CACHE_MAX_AGE || 3600}` // 缓存时间
      }
    });
    
  } catch (error) {
    console.error(`❌ 生成 ${params.lang} 语言站点地图失败:`, error);
    
    // 返回错误响应
    return new Response('Error generating sitemap', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

/**
 * 生成静态路径
 */
export async function getStaticPaths() {
  return SUPPORTED_LANGUAGES.map(lang => ({
    params: { lang }
  }));
}
