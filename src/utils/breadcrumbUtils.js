/**
 * 面包屑工具函数
 * 用于生成标准化的面包屑导航数据
 */

import { generateUrl } from '@utils/tools.js';

/**
 * 生成详情页面的面包屑（产品、案例、新闻通用）
 */
export function generateDetailBreadcrumbs(lang, itemName, categorySlug, type = 'products') {
  const typeConfig = {
    products: { label: 'products', path: '/products' },
    case: { label: 'case', path: '/case' },
    news: { label: 'news', path: '/news' }
  };

  const config = typeConfig[type] || typeConfig.products;
  
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: config.label, href: generateUrl(lang, config.path) }
  ];

  if (categorySlug) {
    const cleanSlug = categorySlug.replace(/^\/+|\/+$/g, '');
    breadcrumbs.push({
      label: cleanSlug,
      href: generateUrl(lang, `${config.path}/${cleanSlug}`)
    });
  }

  breadcrumbs.push({ label: itemName });

  return breadcrumbs;
}

/**
 * 生成产品页面的面包屑
 */
export function generateProductDetailBreadcrumbs(lang, productName, categorySlug) {
  return generateDetailBreadcrumbs(lang, productName, categorySlug, 'products');
}

/**
 * 生成案例页面的面包屑
 */
export function generateCaseDetailBreadcrumbs(lang, caseName, categorySlug) {
  return generateDetailBreadcrumbs(lang, caseName, categorySlug, 'case');
}

/**
 * 生成新闻页面的面包屑
 */
export function generateNewsDetailBreadcrumbs(lang, newsName, categorySlug) {
  return generateDetailBreadcrumbs(lang, newsName, categorySlug, 'news');
}

/**
 * 生成列表页面的面包屑（产品、案例、新闻通用）
 */
export function generateListBreadcrumbs(lang, type = 'products', category = null, page = null) {
  const typeConfig = {
    products: { label: 'products', path: '/products' },
    case: { label: 'case', path: '/case' },
    news: { label: 'news', path: '/news' }
  };

  const config = typeConfig[type] || typeConfig.products;
  
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') }
  ];

  if (category) {
    breadcrumbs.push({ label: config.label, href: generateUrl(lang, config.path) });
    breadcrumbs.push({ label: category });
  } else if (page && page > 1) {
    breadcrumbs.push({ label: config.label, href: generateUrl(lang, `${config.path}/${page}`) });
  } else {
    breadcrumbs.push({ label: config.label });
  }

  return breadcrumbs;
}

/**
 * 生成产品列表页面的面包屑
 */
export function generateProductListBreadcrumbs(lang, category) {
  return generateListBreadcrumbs(lang, 'products', category);
}

/**
 * 生成案例列表页面的面包屑
 */
export function generateCaseListBreadcrumbs(lang, category) {
  return generateListBreadcrumbs(lang, 'case', category);
}

/**
 * 生成新闻列表页面的面包屑
 */
export function generateNewsListBreadcrumbs(lang, page) {
  return generateListBreadcrumbs(lang, 'news', null, page);
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