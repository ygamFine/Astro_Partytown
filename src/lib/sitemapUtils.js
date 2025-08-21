/**
 * 站点地图工具函数
 * 提供站点地图生成、验证和管理功能
 * 支持多语言站点地图生成
 */

import { SUPPORTED_LANGUAGES } from './i18n-routes.js';
import { getProducts } from './strapi.js';
import { getNews } from './strapi.js';
import { getCases } from './strapi.js';

// 加载环境变量
import { config } from 'dotenv';
config();

// 动态获取当前域名
const getCurrentDomain = () => {
  // 在服务器端运行时，尝试从环境变量获取域名
  if (typeof process !== 'undefined' && process.env) {
    // 优先使用当前请求的域名
    if (process.env.CURRENT_HOSTNAME) {
      const hostname = process.env.CURRENT_HOSTNAME;
      // 如果是生产环境域名，提取主域名
      if (hostname.includes('aihuazhi.cn')) {
        return 'aihuazhi.cn';
      }
      return hostname;
    }
    // 使用环境变量中的域名
    if (process.env.PUBLIC_SITE_URL) {
      return new URL(process.env.PUBLIC_SITE_URL).hostname;
    }
    if (process.env.VERCEL_URL) {
      return process.env.VERCEL_URL;
    }
  }
  
  // 在客户端运行时，使用当前域名
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  
  // 构建时和生产环境默认域名
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'production') {
      return 'aihuazhi.cn';
    }
  }
  
  // 开发环境默认域名
  return 'localhost';
};

// 获取站点URL - 动态使用当前域名
const getSiteUrl = (lang = 'en') => {
  const currentDomain = getCurrentDomain();
  
  // 语言到子域名的映射
  const langToSubdomain = {
    'en': 'en',
    'zh-CN': 'zh', 
    'zh-Hant': 'zh-hant',
    'ar': 'ar',
    'de': 'de',
    'fr': 'fr',
    'it': 'it',
    'tr': 'tr',
    'es': 'es',
    'pt-pt': 'pt',
    'nl': 'nl',
    'pl': 'pl',
    'ru': 'ru',
    'th': 'th',
    'id': 'id',
    'vi': 'vi',
    'ms': 'ms',
    'ml': 'ml',
    'my': 'my',
    'hi': 'hi',
    'ja': 'ja',
    'ko': 'ko'
  };
  
  const subdomain = langToSubdomain[lang] || 'en';
  
  // 强制使用生产环境域名
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return `https://${subdomain}.aihuazhi.cn`;
  }
  
  // 处理域名逻辑
  if (currentDomain === 'localhost') {
    // 开发环境
    return `https://${subdomain}.${currentDomain}`;
  } else if (currentDomain.includes('aihuazhi.cn')) {
    // 生产环境 - 使用当前请求的完整域名
    return `https://${subdomain}.aihuazhi.cn`;
  } else {
    // 其他环境 - 使用当前域名
    return `https://${subdomain}.${currentDomain}`;
  }
};

// 站点配置
export const SITE_CONFIG = {
  defaultLanguage: 'en',
  supportedLanguages: SUPPORTED_LANGUAGES,
  // 页面优先级配置
  priorities: {
    home: 1.0,
    about: 0.8,
    contact: 0.8,
    products: 0.9,
    productDetail: 0.7,
    news: 0.8,
    newsDetail: 0.6,
    cases: 0.8,
    caseDetail: 0.6,
    search: 0.5
  },
  // 更新频率配置
  changeFreq: {
    home: 'daily',
    about: 'monthly',
    contact: 'monthly',
    products: 'weekly',
    productDetail: 'monthly',
    news: 'daily',
    newsDetail: 'monthly',
    cases: 'weekly',
    caseDetail: 'monthly',
    search: 'weekly'
  }
};

/**
 * 生成静态页面URL列表
 */
export function generateStaticPages() {
  const pages = [];
  
  for (const lang of SITE_CONFIG.supportedLanguages) {
    const siteUrl = getSiteUrl(lang);
    
    // 首页 - 使用子域名，不添加语言路径
    pages.push({
      url: siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.home,
      priority: SITE_CONFIG.priorities.home,
      lang: lang,
      type: 'home'
    });
    
    // 关于我们
    pages.push({
      url: `${siteUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.about,
      priority: SITE_CONFIG.priorities.about,
      lang: lang,
      type: 'about'
    });
    
    // 联系我们
    pages.push({
      url: `${siteUrl}/contact`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.contact,
      priority: SITE_CONFIG.priorities.contact,
      lang: lang,
      type: 'contact'
    });
    
    // 产品列表页
    pages.push({
      url: `${siteUrl}/products`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.products,
      priority: SITE_CONFIG.priorities.products,
      lang: lang,
      type: 'products'
    });
    
    // 案例列表页
    pages.push({
      url: `${siteUrl}/case`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.cases,
      priority: SITE_CONFIG.priorities.cases,
      lang: lang,
      type: 'cases'
    });
    
    // 新闻列表页
    pages.push({
      url: `${siteUrl}/news`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.news,
      priority: SITE_CONFIG.priorities.news,
      lang: lang,
      type: 'news'
    });
    
    // 搜索页
    pages.push({
      url: `${siteUrl}/search`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.search,
      priority: SITE_CONFIG.priorities.search,
      lang: lang,
      type: 'search'
    });
  }
  
  return pages;
}

/**
 * 生成产品页面URL列表
 */
export async function generateProductPages() {
  const pages = [];
  
  for (const lang of SITE_CONFIG.supportedLanguages) {
    try {
      const products = await getProducts(lang);
      const siteUrl = getSiteUrl(lang);
      
      if (products && products.length > 0) {
        products.forEach(product => {
          if (product.slug) {
            pages.push({
              url: `${siteUrl}/products/${product.slug}`,
              lastmod: product.updatedAt || product.publishedAt || new Date().toISOString(),
              changefreq: SITE_CONFIG.changeFreq.productDetail,
              priority: SITE_CONFIG.priorities.productDetail,
              lang: lang,
              type: 'productDetail',
              title: product.name,
              category: product.category
            });
          }
        });
      }
    } catch (error) {
      console.error(`获取 ${lang} 语言产品数据失败:`, error);
    }
  }
  
  return pages;
}

/**
 * 生成新闻页面URL列表
 */
export async function generateNewsPages() {
  const pages = [];
  
  for (const lang of SITE_CONFIG.supportedLanguages) {
    try {
      const news = await getNews(lang);
      const siteUrl = getSiteUrl(lang);
      
      if (news && news.length > 0) {
        news.forEach(item => {
          if (item.slug) {
            pages.push({
              url: `${siteUrl}/news/${item.slug}`,
              lastmod: item.updatedAt || item.publishedAt || item.date || new Date().toISOString(),
              changefreq: SITE_CONFIG.changeFreq.newsDetail,
              priority: SITE_CONFIG.priorities.newsDetail,
              lang: lang,
              type: 'newsDetail',
              title: item.title,
              category: item.category
            });
          }
        });
      }
    } catch (error) {
      console.error(`获取 ${lang} 语言新闻数据失败:`, error);
    }
  }
  
  return pages;
}

/**
 * 生成案例页面URL列表
 */
export async function generateCasePages() {
  const pages = [];
  
  for (const lang of SITE_CONFIG.supportedLanguages) {
    try {
      const cases = await getCases(lang);
      const siteUrl = getSiteUrl(lang);
      
      if (cases && cases.length > 0) {
        cases.forEach(caseItem => {
          pages.push({
            url: `${siteUrl}/case/${caseItem.id}`,
            lastmod: caseItem.updatedAt || caseItem.publishedAt || caseItem.date || new Date().toISOString(),
            changefreq: SITE_CONFIG.changeFreq.caseDetail,
            priority: SITE_CONFIG.priorities.caseDetail,
            lang: lang,
            type: 'caseDetail',
            title: caseItem.title,
            category: caseItem.category
          });
        });
      }
    } catch (error) {
      console.error(`获取 ${lang} 语言案例数据失败:`, error);
    }
  }
  
  return pages;
}

/**
 * 生成XML格式的站点地图
 */
export function generateSitemapXML(pages) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  // 生成URL条目，包含多语言链接
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    
    // 添加多语言替代链接（仅对非首页）
    if (page.type !== 'home') {
      // 为每个语言添加替代链接
      SITE_CONFIG.supportedLanguages.forEach(lang => {
        const altUrl = page.url.replace(getSiteUrl(page.lang), getSiteUrl(lang));
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${altUrl}" />\n`;
      });
      
      // 添加默认语言链接
      const defaultUrl = page.url.replace(getSiteUrl(page.lang), getSiteUrl(SITE_CONFIG.defaultLanguage));
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />\n`;
    }
    
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

/**
 * 生成按语言分组的站点地图
 */
export function generateLanguageSpecificSitemap(pages, language) {
  const languagePages = pages.filter(page => page.lang === language);
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  languagePages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

/**
 * 生成站点地图索引XML
 */
export function generateSitemapIndexXML() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 主站点地图
  xml += '  <sitemap>\n';
  xml += `    <loc>${getSiteUrl('en')}/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // 按语言分组的站点地图
  SITE_CONFIG.supportedLanguages.forEach(lang => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${getSiteUrl(lang)}/sitemap-${lang}.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  return xml;
}

/**
 * 验证URL是否有效
 */
export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证站点地图数据
 */
export function validateSitemapData(pages) {
  const errors = [];
  
  pages.forEach((page, index) => {
    // 验证URL
    if (!validateURL(page.url)) {
      errors.push(`页面 ${index + 1}: 无效的URL - ${page.url}`);
    }
    
    // 验证优先级
    if (page.priority < 0 || page.priority > 1) {
      errors.push(`页面 ${index + 1}: 优先级必须在0-1之间 - ${page.priority}`);
    }
    
    // 验证更新频率
    const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    if (!validFreqs.includes(page.changefreq)) {
      errors.push(`页面 ${index + 1}: 无效的更新频率 - ${page.changefreq}`);
    }
    
    // 验证最后修改时间
    if (!page.lastmod || isNaN(new Date(page.lastmod).getTime())) {
      errors.push(`页面 ${index + 1}: 无效的最后修改时间 - ${page.lastmod}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 生成站点地图统计信息
 */
export function generateSitemapStats(pages) {
  const stats = {
    total: pages.length,
    byLanguage: {},
    byType: {},
    byPriority: {
      high: 0,    // 0.8-1.0
      medium: 0,  // 0.5-0.7
      low: 0      // 0.1-0.4
    }
  };
  
  pages.forEach(page => {
    // 按语言统计
    if (!stats.byLanguage[page.lang]) {
      stats.byLanguage[page.lang] = 0;
    }
    stats.byLanguage[page.lang]++;
    
    // 按类型统计
    if (!stats.byType[page.type]) {
      stats.byType[page.type] = 0;
    }
    stats.byType[page.type]++;
    
    // 按优先级统计
    if (page.priority >= 0.8) {
      stats.byPriority.high++;
    } else if (page.priority >= 0.5) {
      stats.byPriority.medium++;
    } else {
      stats.byPriority.low++;
    }
  });
  
  return stats;
}

/**
 * 生成完整的站点地图
 */
export async function generateFullSitemap() {
  // 生成所有页面URL
  const staticPages = generateStaticPages();
  const productPages = await generateProductPages();
  const newsPages = await generateNewsPages();
  const casePages = await generateCasePages();
  
  // 合并所有页面
  const allPages = [
    ...staticPages,
    ...productPages,
    ...newsPages,
    ...casePages
  ];
  
  // 生成XML
  const sitemapXML = generateSitemapXML(allPages);
  
  return {
    xml: sitemapXML,
    pages: allPages
  };
}

/**
 * 构建时生成站点地图文件
 */
export async function buildSitemapFiles() {
  try {
    const sitemapData = await generateFullSitemap();
    
    // 这里可以添加文件写入逻辑
    // 在 Astro 构建过程中，这些文件会自动生成
    
    return sitemapData;
  } catch (error) {
    console.error('❌ 构建站点地图文件失败:', error);
    throw error;
  }
} 