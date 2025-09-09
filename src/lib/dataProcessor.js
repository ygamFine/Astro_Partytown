/**
 * 通用数据处理工具
 * 用于处理不同类型的数据转换和格式化
 */

import { processImage } from './imageProcessor.js';
import { generateUrl } from '@utils/tools.js';

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
          href: generateUrl(lang, '/products', product.slug)
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
    href: generateUrl(lang, '/news', newsItem.slug || newsItem.id),
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
    href: generateUrl(lang, '/case', caseItem.id)
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



// 生成面包屑导航
export function generateBreadcrumbs(lang, type, currentPage) {
  const baseBreadcrumbs = [
    { name: 'Home', href: generateUrl(lang, '/') }
  ];
  
  const typeBreadcrumbs = {
    products: { name: 'Products', href: generateUrl(lang, '/products') },
          news: { name: 'News', href: generateUrl(lang, '/news') },
      case: { name: 'Case', href: generateUrl(lang, '/case') }
  };
  
  if (typeBreadcrumbs[type]) {
    baseBreadcrumbs.push(typeBreadcrumbs[type]);
  }
  
  // 如果有分页且不是第一页，添加分页信息
  if (currentPage && currentPage > 1) {
    baseBreadcrumbs.push({
      name: `Page ${currentPage}`,
      href: generateUrl(lang, `/${type}${currentPage > 1 ? `/${currentPage}` : ''}`)
    });
  }
  
  return baseBreadcrumbs;
} 