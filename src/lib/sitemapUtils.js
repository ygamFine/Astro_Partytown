/**
 * 站点地图工具函数
 * 提供站点地图生成、验证和管理功能
 */

import { getEnabledLanguages, getDefaultLanguage } from './i18n-config.js';
import { getProducts } from './strapi.js';
import { getNews } from './strapi.js';
import { getCases } from './strapi.js';

// 加载环境变量
import { config } from 'dotenv';
config();

// 获取环境变量中的域名配置
const getSiteUrl = () => {
  // 优先使用环境变量
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL;
  }
  
  // 根据环境使用不同的域名
  if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_SITE_URL;
  }
  
  // 生产环境默认域名
  return process.env.PROD_SITE_URL;
};

// 站点配置
export const SITE_CONFIG = {
  baseUrl: getSiteUrl(),
  defaultLanguage: getDefaultLanguage(),
  supportedLanguages: getEnabledLanguages(),
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
    // 首页
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang === SITE_CONFIG.defaultLanguage ? '' : lang}`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.home,
      priority: SITE_CONFIG.priorities.home,
      lang: lang,
      type: 'home'
    });
    
    // 关于我们
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/about`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.about,
      priority: SITE_CONFIG.priorities.about,
      lang: lang,
      type: 'about'
    });
    
    // 联系我们
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/contact`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.contact,
      priority: SITE_CONFIG.priorities.contact,
      lang: lang,
      type: 'contact'
    });
    
    // 产品列表页
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/products`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.products,
      priority: SITE_CONFIG.priorities.products,
      lang: lang,
      type: 'products'
    });
    
    // 案例列表页
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/case`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.cases,
      priority: SITE_CONFIG.priorities.cases,
      lang: lang,
      type: 'cases'
    });
    
    // 新闻列表页
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/news`,
      lastmod: new Date().toISOString(),
      changefreq: SITE_CONFIG.changeFreq.news,
      priority: SITE_CONFIG.priorities.news,
      lang: lang,
      type: 'news'
    });
    
    // 搜索页
    pages.push({
      url: `${SITE_CONFIG.baseUrl}/${lang}/search`,
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
      
      if (products && products.length > 0) {
        products.forEach(product => {
          if (product.slug) {
            pages.push({
              url: `${SITE_CONFIG.baseUrl}/${lang}/products/${product.slug}`,
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
      
      if (news && news.length > 0) {
        news.forEach(item => {
          if (item.slug) {
            pages.push({
              url: `${SITE_CONFIG.baseUrl}/${lang}/news/${item.slug}`,
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
      
      if (cases && cases.length > 0) {
        cases.forEach(caseItem => {
          pages.push({
            url: `${SITE_CONFIG.baseUrl}/${lang}/case/${caseItem.id}`,
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
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 生成URL条目 - 简化版本，只包含URL和最后修改时间
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
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
  xml += `    <loc>${SITE_CONFIG.baseUrl}/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  // 按语言分组的站点地图
  SITE_CONFIG.supportedLanguages.forEach(lang => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${SITE_CONFIG.baseUrl}/sitemap-${lang}.xml</loc>\n`;
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
  try {
    
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
    
    // 验证数据
    const validation = validateSitemapData(allPages);
    if (!validation.isValid) {
      console.error('❌ 站点地图数据验证失败:', validation.errors);
      throw new Error('站点地图数据验证失败');
    }
    
    // 生成统计信息
    const stats = generateSitemapStats(allPages);
    
    // 生成XML
    const sitemapXML = generateSitemapXML(allPages);
    

    
    return {
      xml: sitemapXML,
      pages: allPages,
      stats: stats,
      validation: validation
    };
    
  } catch (error) {
    console.error('❌ 生成完整站点地图失败:', error);
    throw error;
  }
} 