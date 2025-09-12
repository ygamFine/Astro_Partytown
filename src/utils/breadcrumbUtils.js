/**
 * 面包屑工具函数
 * 用于生成标准化的面包屑导航数据
 */

import { generateUrl } from '@utils/tools.js';

/**
 * 生成产品页面的面包屑
 */
export function generateProductBreadcrumbs(lang, productName, categorySlug) {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'products', href: generateUrl(lang, '/products') }
  ];

  if (categorySlug) {
    // 去除 categorySlug 前后的所有斜杠
    const cleanSlug = categorySlug.replace(/^\/+|\/+$/g, '');
    breadcrumbs.push({
      label: cleanSlug,
      href: generateUrl(lang, `/products/${cleanSlug}`)
    });
  }

  breadcrumbs.push({ label: productName });

  return breadcrumbs;
}

/**
 * 生成产品列表页面的面包屑
 */
export function generateProductListBreadcrumbs(lang, category) {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') }
  ];

  if (category) {
    breadcrumbs.push({ label: 'products', href: generateUrl(lang, '/products') });
    breadcrumbs.push({ label: category });
  } else {
    breadcrumbs.push({ label: 'products' });
  }

  return breadcrumbs;
}

/**
 * 生成新闻页面的面包屑
 */
export function generateNewsBreadcrumbs(lang, page) {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'news', href: generateUrl(lang, page && page > 1 ? `/news/${page}` : `/news`) }
  ];

  return breadcrumbs;
}

/**
 * 生成新闻详情页面的面包屑
 */
export function generateNewsDetailBreadcrumbs(lang, newsTitle) {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'news', href: generateUrl(lang, '/news') },
    { label: newsTitle }
  ];
}

/**
 * 生成案例页面的面包屑
 */
export function generateCaseBreadcrumbs(lang, page) {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'case', href: generateUrl(lang, page && page > 1 ? `/case/${page}` : `/case`) }
  ];

  return breadcrumbs;
}

/**
 * 生成案例详情页面的面包屑
 */
export function generateCaseDetailBreadcrumbs(lang, caseTitle) {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'case', href: generateUrl(lang, '/case') },
    { label: caseTitle }
  ];
}

/**
 * 生成关于页面的面包屑
 */
export function generateAboutBreadcrumbs(lang) {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'about' }
  ];
}

/**
 * 生成联系页面的面包屑
 */
export function generateContactBreadcrumbs(lang) {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'contact' }
  ];
}

/**
 * 生成搜索页面的面包屑
 */
export function generateSearchBreadcrumbs(lang, searchTerm) {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'search', href: generateUrl(lang, '/search') },
    { label: searchTerm || 'search' }
  ];
}

/**
 * 生成分类页面的面包屑 - 支持多级分类
 * @param {string} lang - 语言代码
 * @param {Object} categoryPath - 分类信息对象
 * @param {string} basePath - 基础路径，如 '/products', '/news', '/case' 等
 * @param {string} baseLabel - 基础标签，如 'products', 'news', 'case' 等
 * @returns {Array} 面包屑数组
 */
export function generateCategoryBreadcrumbs(lang, categoryPath, basePath = '/products', baseLabel = 'products') {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: baseLabel, href: generateUrl(lang, basePath) }
  ];
  
  if (categoryPath && categoryPath.length > 0) {
    const segments = categoryPath.split('/').filter(s => s);
    segments.forEach((segment, index) => {
      const path = segments.slice(0, index + 1).join('/');
      breadcrumbs.push({
        label: segment,
        href: generateUrl(lang, `${basePath}/${path}`)
      });
    });
  }
  
  return breadcrumbs;
}



/**
 * 生成自定义面包屑
 */
export function generateCustomBreadcrumbs(lang, items) {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') }
  ];

  breadcrumbs.push(...items);

  return breadcrumbs;
} 