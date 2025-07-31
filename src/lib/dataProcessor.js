/**
 * 通用数据处理工具
 * 用于处理不同类型的数据转换和格式化
 */

import { processImage } from './imageProcessor.js';

// 处理产品数据
export function processProductData(products, lang, imageMapping) {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => ({
    id: product.id,
    title: product.name,
    image: processImage(product.image, imageMapping),
    excerpt: product.excerpt,
    category: product.category,
    price: product.price || null, // 添加价格字段
    advantages: product.advantages || product.advantages_list || [], // 添加优势字段
    href: `/${lang}/products/${product.slug}`
  }));
}

// 处理新闻数据
export function processNewsData(news, lang) {
  if (!news || !Array.isArray(news)) return [];
  
  // 按日期倒序排序
  const sortedNews = news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return sortedNews.map(newsItem => ({
    id: newsItem.id,
    title: newsItem.title,
    image: processNewsImage(newsItem.image),
    excerpt: newsItem.excerpt,
    date: newsItem.date,
    href: `/${lang}/news/${newsItem.slug || newsItem.id}`,
  }));
}

// 处理案例数据
export function processCaseData(cases, lang, imageMapping) {
  if (!cases || !Array.isArray(cases)) return [];
  
  return cases.map(caseItem => ({
    id: caseItem.id,
    title: caseItem.title,
    image: processImage(caseItem.image, imageMapping),
    excerpt: caseItem.excerpt,
    category: caseItem.category,
    href: `/${lang}/case/${caseItem.id}`
  }));
}

// 处理新闻图片（简化版本，不使用复杂的映射）
function processNewsImage(imageData) {
  if (!imageData) return null;
  
  if (typeof imageData === 'string') {
    // 如果是外部URL，返回null
    if (imageData.startsWith('http')) {
      return null;
    }
    // 如果是本地路径且格式正确，返回原路径
    if (imageData.match(/\.(jpe?g|png|webp|gif|svg|avif|tiff?)$/i)) {
      return imageData;
    }
  }
  
  return null;
}

// 加载翻译文件
export async function loadTranslations(lang, translationKeys) {
  const translations = {};
  
  for (const key of translationKeys) {
    try {
      const translation = await import(`../locales/${lang}/${key}.json`);
      translations[key] = translation.default;
    } catch (error) {
      // 如果加载失败，使用英文作为默认
      try {
        const fallbackTranslation = await import(`../locales/en/${key}.json`);
        translations[key] = fallbackTranslation.default;
      } catch (fallbackError) {
        console.warn(`无法加载翻译文件: ${key}`, fallbackError.message);
        translations[key] = {};
      }
    }
  }
  
  return translations;
}

// 生成面包屑导航
export function generateBreadcrumbs(lang, type, currentPage) {
  const baseBreadcrumbs = [
    { name: 'Home', href: `/${lang}/` }
  ];
  
  const typeBreadcrumbs = {
    products: { name: 'Products', href: `/${lang}/products` },
    news: { name: 'News', href: `/${lang}/news` },
    case: { name: 'Case', href: `/${lang}/case` }
  };
  
  if (typeBreadcrumbs[type]) {
    baseBreadcrumbs.push(typeBreadcrumbs[type]);
  }
  
  // 如果有分页且不是第一页，添加分页信息
  if (currentPage && currentPage > 1) {
    baseBreadcrumbs.push({
      name: `Page ${currentPage}`,
      href: `/${lang}/${type}${currentPage > 1 ? `/${currentPage}` : ''}`
    });
  }
  
  return baseBreadcrumbs;
} 