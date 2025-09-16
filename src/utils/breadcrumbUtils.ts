/**
 * 面包屑工具函数
 * 用于生成标准化的面包屑导航数据
 */

import { generateUrl } from '@utils/tools.js';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

type PageType = 'products' | 'case' | 'news';

/**
 * 生成列表页面的面包屑（产品、案例、新闻通用）
 */
export function generateListBreadcrumbs(lang: string, type: PageType = 'products', category: string | null = null, page: number | null = null): BreadcrumbItem[] {
  const typeConfig = {
    products: { label: 'products', path: '/products' },
    case: { label: 'case', path: '/case' },
    news: { label: 'news', path: '/news' }
  };

  const config = typeConfig[type] || typeConfig.products;
  
  const breadcrumbs: BreadcrumbItem[] = [
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
export function generateProductListBreadcrumbs(lang: string, category: string | null = null): BreadcrumbItem[] {
  return generateListBreadcrumbs(lang, 'products', category);
}

/**
 * 生成案例列表页面的面包屑
 */
export function generateCaseListBreadcrumbs(lang: string, category: string | null = null): BreadcrumbItem[] {
  return generateListBreadcrumbs(lang, 'case', category);
}

/**
 * 生成新闻列表页面的面包屑
 */
export function generateNewsListBreadcrumbs(lang: string, page: number | null = null): BreadcrumbItem[] {
  return generateListBreadcrumbs(lang, 'news', null, page);
}

/**
 * 生成详情页面的面包屑（产品、案例、新闻通用）
 */
export function generateDetailBreadcrumbs(lang: string, itemName: string, categorySlug: string | null = null, type: PageType = 'products'): BreadcrumbItem[] {
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
export function generateProductDetailBreadcrumbs(lang: string, productName: string, categorySlug: string | null = null): BreadcrumbItem[] {
  return generateDetailBreadcrumbs(lang, productName, categorySlug, 'products');
}

/**
 * 生成案例页面的面包屑
 */
export function generateCaseDetailBreadcrumbs(lang: string, caseName: string, categorySlug: string | null = null): BreadcrumbItem[] {
  return generateDetailBreadcrumbs(lang, caseName, categorySlug, 'case');
}

/**
 * 生成新闻页面的面包屑
 */
export function generateNewsDetailBreadcrumbs(lang: string, newsName: string, categorySlug: string | null = null): BreadcrumbItem[] {
  return generateDetailBreadcrumbs(lang, newsName, categorySlug, 'news');
}



/**
 * 生成关于页面的面包屑
 */
export function generateAboutBreadcrumbs(lang: string): BreadcrumbItem[] {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'about' }
  ];
}

/**
 * 生成联系页面的面包屑
 */
export function generateContactBreadcrumbs(lang: string): BreadcrumbItem[] {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'contact' }
  ];
}

/**
 * 生成搜索页面的面包屑
 */
export function generateSearchBreadcrumbs(lang: string, searchTerm: string | null = null): BreadcrumbItem[] {
  return [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: 'search', href: generateUrl(lang, '/search') },
    { label: searchTerm || 'search' }
  ];
}

/**
 * 生成分类页面的面包屑 - 支持多级分类
 */
export function generateCategoryBreadcrumbs(lang: string, categoryPath: {path: string, name: string}, basePath: string = '/products', baseLabel: string = 'products'): BreadcrumbItem[] {
  const breadcrumbs = [
    { label: 'home', href: generateUrl(lang, '/') },
    { label: baseLabel, href: generateUrl(lang, basePath) }
  ];
  
  if (categoryPath?.path && categoryPath?.path.length > 0) {
    const segments = categoryPath?.path.split('/').filter(s => s);
    segments.forEach((segment, index) => {
      const path = segments.slice(0, index + 1).join('/');
      breadcrumbs.push({
        label: categoryPath.name,
        href: generateUrl(lang, `${basePath}/${path}`)
      });
    });
  }
  
  return breadcrumbs;
}
