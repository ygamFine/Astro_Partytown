/**
 * 动态生成 robots.txt 文件
 * 使用环境变量中的域名配置
 */

// 获取环境变量中的域名配置
const getSiteUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.PUBLIC_SITE_URL) {
    return import.meta.env.PUBLIC_SITE_URL;
  }

  // 根据环境使用不同的域名
  if (import.meta.env.DEV) {
    return import.meta.env.DEV_SITE_URL;
  }

  // 生产环境默认域名
  return import.meta.env.PROD_SITE_URL;
};

export async function GET() {
  const siteUrl = getSiteUrl();

  const robotsTxt = `
User-agent: *
Allow: /

# 允许访问所有页面
Allow: /en/
Allow: /zh-Hans/
Allow: /zh-Hant/
Allow: /fr/
Allow: /de/
Allow: /it/
Allow: /tr/
Allow: /es/
Allow: /pt-pt/
Allow: /nl/
Allow: /pl/
Allow: /ar/
Allow: /ru/
Allow: /th/
Allow: /id/
Allow: /vi/
Allow: /ms/
Allow: /ml/
Allow: /my/
Allow: /hi/
Allow: /ja/
Allow: /ko/

# 允许访问静态资源
Allow: /images/
Allow: /_astro/
Allow: /images/favicon.svg

# 禁止访问管理后台和API
Disallow: /admin/
Disallow: /api/
Disallow: /wp-admin/
Disallow: /wp-includes/

# 禁止访问临时文件和日志
Disallow: /tmp/
Disallow: /logs/
Disallow: /*.log
Disallow: /*.tmp

# 禁止访问搜索参数页面（避免重复内容）
Disallow: /*?*
Disallow: /*&*

# 站点地图
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap-index.xml

# 爬取延迟（秒）
Crawl-delay: ${import.meta.env.CRAWL_DELAY}

# 特殊爬虫规则
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# 禁止图片爬虫访问非图片资源
User-agent: Googlebot-Image
Allow: /images/
Allow: /_astro/
Disallow: /

User-agent: Bingbot-Image
Allow: /images/
Allow: /_astro/
Disallow: /

# 禁止移动端爬虫的特殊规则
User-agent: Googlebot-Mobile
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot-Mobile
Allow: /
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, max-age=${import.meta.env.CACHE_MAX_AGE}` // 缓存时间
    }
  });
} 