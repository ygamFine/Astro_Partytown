/**
 * 面包屑工具函数
 * 用于生成标准化的面包屑导航数据
 */

import { generateUrl } from '@utils/tools.js';
import { getDictionary } from '@i18n/dictionaries'
import { type ContentType as PageType } from './staticPathsParams';

interface BreadcrumbItem {
  label: string;
  href?: string;
}


/**
 * 生成基础面包屑
 * @param lang 语言
 * @param from 来源页面
 * @param children 子页面
 * @returns 面包屑
 */
const baseBreadcrumbs = async (lang: string, from: PageType, children?: string | BreadcrumbItem[]) => {
  const t = await getDictionary(lang);

  const breadcrumbs: BreadcrumbItem[] = [{ label: t.breadcrumb.home, href: generateUrl(lang, '/') }];

  if (from) {
    breadcrumbs.push({ label: t.breadcrumb[from] || '', href: generateUrl(lang, `/${from}`) });
  }
  if (children) {
    if (typeof children === 'string') {
      breadcrumbs.push({ label: children, href: generateUrl(lang, `/${from}/${children}`) });
    } else {
      breadcrumbs.push(...children);
    }
  }
  return breadcrumbs
}

/**
 * 生成列表页面的面包屑（产品、案例、新闻通用）
 */
export function generateListBreadcrumbs(lang: string, type: PageType, category: string | null = null, page: number | null = null): BreadcrumbItem[] {
  const typeConfig = {
    products: { label: 'products', path: '/products' },
    case: { label: 'case', path: '/case' },
    news: { label: 'news', path: '/news' },
    about: { label: 'about', path: '/about' }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || {};
  
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
export async function generateCategoryBreadcrumbs(lang: string, from: PageType = 'products', category?: {path: string, name: string} | {path: string, name: string}[]): Promise<BreadcrumbItem[]> {
  const newsBreadcrumbs: BreadcrumbItem[] = [];
  if (Array.isArray(category)) {
    category.map(item => {
      if(item.path && item.name) {
        newsBreadcrumbs.push({
          label: item.name,
          href: generateUrl(lang, '/' + from, item.path)
        });
      }
    });
  } else {
    newsBreadcrumbs.push({
      label: category?.name || '',
      href: generateUrl(lang, '/' + from, category?.path || '')
    });
  }
  const breadcrumbs = await baseBreadcrumbs(lang, from, newsBreadcrumbs)
  console.log('breadcrumbs', breadcrumbs)
  return breadcrumbs;
}
